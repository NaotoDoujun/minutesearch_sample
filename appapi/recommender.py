# -*- coding: utf-8 -*-
import io
import datetime
from elasticsearch import Elasticsearch, helpers
import mojimoji
import spacy
from enum import Enum
import pandas as pd
from sentence_transformers import SentenceTransformer
import pymongo
from pymongo import MongoClient
import config

class RateType(str, Enum):
    good = "good"
    bad = "bad"

class IndexNotFoundException(Exception):
    def __init__(self, message):
        super().__init__(message)

class DocumentNotFoundException(Exception):
    def __init__(self, message):
        super().__init__(message)

class UserRateRecordFailedException(Exception):
    def __init__(self, message):
        super().__init__(message)

class MinuteRecommender():

    TARGET_LABEL = "Conference"

    def __init__(self, logger):
        self.logger = logger
        self.nlp = spacy.load(config.GINZA_MODEL)
        self.es = Elasticsearch(config.ES_ENDPOINT, request_timeout=100)

    def str_multi2single(self, text):
        return ''.join(text.split()).translate(str.maketrans({chr(0xFF01 + i): chr(0x21 + i) for i in range(94)}))

    def input_search(self, id = '', param = '', size = 10, start = 0):
        try:
            if self.es.indices.exists(index=config.INPUT_ES_INDEX_NAME):
                q = {"match_all": {}}
                if id:
                    q= {"term": {"_id": id}}
                else:
                    if param:
                        terms = [self.str_multi2single(term) for term in param.split()]
                        self.logger.info("Search Terms: {}".format(terms))
                        q={"multi_match": {
                            "query": ' '.join(terms), 
                            "fields": [ "filename", "text", "tags" ] 
                        }}
                
                response = self.es.search(
                    index=config.INPUT_ES_INDEX_NAME, 
                    query=q,
                    sort=[{"filename": "asc"}],
                    size=size,
                    from_=start
                )
                total = response['hits']['total']
                hits = [
                    {
                        'id': row['_id'],
                        'page': row['_source']['page'], 
                        'text': row['_source']['text'], 
                        'tags': row['_source']['tags'],
                        'image': row['_source']['image'],
                        'filename': row['_source']['filename'], 
                        'path': row['_source']['path'], 
                        'score': row['_score'],
                    }
                    for row in response['hits']['hits']
                ]
                return {"total": total, "hits": hits}
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.INPUT_ES_INDEX_NAME))
        except:
            raise

    def minutes_search(self, text, size = 10, start = 0):
        try:
            if self.es.indices.exists(index=config.MINUTE_ES_INDEX_NAME):
                doc = self.nlp(text)
                terms = [self.str_multi2single(ent.text) for ent in doc.ents if ent.label_ == self.TARGET_LABEL]
                self.logger.info("Search Terms: {}".format(terms))
                response = self.es.search(
                    index=config.MINUTE_ES_INDEX_NAME,
                    query={
                        "match": {
                            "tags": ' '.join(terms)
                        }
                    },
                    size=size,
                    from_=start
                )
                total = response['hits']['total']
                hits = [
                    {
                        'id': row['_id'],
                        'page': row['_source']['page'], 
                        'text': row['_source']['text'], 
                        'tags': row['_source']['tags'],
                        'image': row['_source']['image'],
                        'filename': row['_source']['filename'], 
                        'path': row['_source']['path'], 
                        'score': row['_score'],
                    }
                    for row in response['hits']['hits']
                ]

                return {"total": total, "hits": hits}
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.MINUTE_ES_INDEX_NAME))
        except:
            raise

class TroubleShootRecommender():
    
    def __init__(self, logger):
        self.logger = logger
        self.model = SentenceTransformer(config.SENTENCE_MODEL)
        self.es = Elasticsearch(config.ES_ENDPOINT, request_timeout=100)
        self.mongo_client = MongoClient("mongodb://mongo:mongo@{}/?retryWrites=true&w=majority".format(config.MONGODB_HOST))

    def get_source(self, id):
        try:
            if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):
                if self.es.exists_source(index=config.TROUBLE_ES_INDEX_NAME, id=id):
                    response = self.es.get_source(index=config.TROUBLE_ES_INDEX_NAME, id=id)
                    return {
                        'document_id': id,
                        'trouble_header': response['trouble_header'],
                        'cause_header': response['cause_header'],
                        'response_header': response['response_header'],
                        'trouble': response['trouble'], 
                        'cause': response['cause'], 
                        'response': response['response'],
                        'rated_users': response['_system_rated_users'] if '_system_rated_users' in response else [],
                        'rating': response['_system_rating'] if '_system_rating' in response else 0,
                        'score': 0,
                    }
                else:
                    raise DocumentNotFoundException("es document: {} not found.".format(id))
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.TROUBLE_ES_INDEX_NAME))    
        except:
            raise

    def troubles_search(self, text, size = 10, min_score = 1.6, from_ = 0):
        try:
            if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):
                extended_stats_rating = self.extended_stats_rating()
                query = mojimoji.zen_to_han(mojimoji.han_to_zen(text, digit=False, ascii=False), kana=False)
                embedding = self.model.encode(query)
                score_formula = '''
                    double raw_full_text_score = _score;
                    double raw_embeddings_score = cosineSimilarity(params.query_vector, 'trouble_vector');
                    double raw_user_rating_score = doc['_system_rating'].size() == 0 ? 0 : doc['_system_rating'].value;
                    double max_rating_score = params.max_rating;
                    double min_rating_score = params.min_rating;
                    double avg_rating_score = params.avg_rating;
                    double std_rating_score = params.std_rating;
                    double full_text_score = sigmoid(raw_full_text_score, 2, 1) + 1.0;
                    double embeddings_score = raw_embeddings_score + 1.0;
                    // Min-Max Normalization
                    double user_rating_score = (raw_user_rating_score - min_rating_score) / (max_rating_score - min_rating_score);
                    if (user_rating_score.isNaN() || user_rating_score.isInfinite()) {
                        user_rating_score = 1.5;
                    } else {
                        user_rating_score += 1.0;
                    }
                    double total_score = (full_text_score * params.full_text_ratio) + (embeddings_score * params.embeddings_ratio) + (user_rating_score * params.user_rating_ratio);
                    return total_score;
                '''.strip()
                script_query = {
                    "script_score": {
                            "query": {
                            "match": {
                                "trouble": query
                            }
                        },
                        "script": {
                            "source": score_formula,
                            "params": { 
                                "query_vector": embedding,
                                "min_rating": extended_stats_rating['min'],
                                "max_rating": extended_stats_rating['max'],
                                "avg_rating": extended_stats_rating['avg'],
                                "std_rating": extended_stats_rating['std_deviation'],
                                "full_text_ratio": config.TROUBLE_FULL_TEXT_RATIO,
                                "embeddings_ratio": config.TROUBLE_EMBEDDINGS_RATIO,
                                "user_rating_ratio": config.TROUBLE_USER_RATING_RATIO,
                            }
                        }
                    }
                }
                response = self.es.search(
                    index=config.TROUBLE_ES_INDEX_NAME,
                    size=size,
                    from_=from_,
                    min_score=min_score,
                    query=script_query
                )
                total = response['hits']['total']
                hits = [
                    {
                        'document_id': row['_id'],
                        'trouble_header': row['_source']['trouble_header'],
                        'cause_header': row['_source']['cause_header'],
                        'response_header': row['_source']['response_header'],
                        'trouble': row['_source']['trouble'], 
                        'cause': row['_source']['cause'], 
                        'response': row['_source']['response'],
                        'rated_users': row['_source']['_system_rated_users'] if '_system_rated_users' in row['_source'] else [],
                        'rating': row['_source']['_system_rating'] if '_system_rating' in row['_source'] else 0,
                        'score': row['_score'],
                    }
                    for row in response['hits']['hits']
                ]
                return {"total": total, "hits": hits}
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.TROUBLE_ES_INDEX_NAME))    
        except:
            raise

    def user_rate(self, document_id, user_id, user_name, rate_type: RateType):
        try:
            if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):
                
                # get rating info by document_id and user_id
                hits = self.get_rating_info(document_id=document_id, user_id=user_id)

                if len(hits) > 0:
                    # update pattern
                    rated_users = hits[0]['rated_users']
                    my_rating_info = [ru for ru in rated_users if ru['user'] == user_id]
                    judge = self.judge_rate(my_rating_info[0], rate_type, hits[0]['rating'])
                    for ru in rated_users:
                        if ru['user'] == user_id:
                            ru['positive'] = judge['positive']
                            ru['negative'] = judge['negative']
                            break
                    response = self.update_rating(document_id=document_id, rated_users=rated_users, rating=judge['rating'])
                    if response['result'] == 'updated':
                        return judge
                    else:
                        raise UserRateRecordFailedException("user rating update failed. target document_id: {}".format(document_id))
                else:
                    # insert pattern
                    # get rating info by document_id only
                    hits = self.get_rating_info_by_document_id(document_id=document_id)
                    if len(hits) > 0:
                        rated_users = hits[0]['rated_users']
                        my_rating_info = {
                            "user": user_id,
                            "user_name": user_name,
                            "positive": False,
                            "negative": False,
                            "positive_comment": "",
                            "negative_comment": ""
                        }
                        judge = self.judge_rate(my_rating_info, rate_type, hits[0]['rating'])
                        my_rating_info['positive'] = judge['positive']
                        my_rating_info['negative'] = judge['negative']
                        rated_users.append(my_rating_info)
                        response = self.update_rating(document_id=document_id, rated_users=rated_users, rating=judge['rating'])
                        if response['result'] == 'updated':
                            return judge
                        else:
                            raise UserRateRecordFailedException("user rating update failed. target document_id: {}".format(document_id))
                    else:
                        raise DocumentNotFoundException("es document: {} not found.".format(document_id))
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.TROUBLE_ES_INDEX_NAME)) 
        except:
            raise

    def record_comment(self, document_id, user_id, comment, rate_type: RateType):
        try:
            if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):
                # get rating info by document_id and user_id
                hits = self.get_rating_info(document_id=document_id, user_id=user_id)
                if len(hits) > 0:
                    rated_users = hits[0]['rated_users']
                    for ru in rated_users:
                        if ru['user'] == user_id:
                            if rate_type == RateType.good:
                                ru['positive_comment'] = comment
                            elif rate_type == RateType.bad:
                                ru['negative_comment'] = comment
                            break
                    return self.update_rated_users(document_id=document_id, rated_users=rated_users)
                else:
                    raise UserRateRecordFailedException("user rating update failed cuz not found. target document_id: {}".format(document_id)) 
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.TROUBLE_ES_INDEX_NAME))   
        except:
            raise

    def judge_rate(self, my_rating_info, rate_type: RateType, rating):
        positive = False
        negative = False
        need_comment = False
        if rate_type == RateType.good:
            if my_rating_info['positive'] == False and my_rating_info['negative'] == False:
                positive = True
                rating = rating + 1
                need_comment = True
            elif my_rating_info['positive'] == True and my_rating_info['negative'] == False:
                rating = rating - 1
            elif my_rating_info['positive'] == False and my_rating_info['negative'] == True:
                positive = True  
                rating = rating + 2
                need_comment = True
        if rate_type == RateType.bad:
            if my_rating_info['positive'] == False and my_rating_info['negative'] == False:
                negative = True
                rating = rating - 1
                need_comment = True
            elif my_rating_info['positive'] == True and my_rating_info['negative'] == False:
                negative = True
                rating = rating - 2
                need_comment = True
            elif my_rating_info['positive'] == False and my_rating_info['negative']== True:
                rating = rating + 1
        return { 
            "positive": positive, 
            "negative": negative, 
            "rating": rating, 
            "positive_comment": my_rating_info['positive_comment'], 
            "negative_comment": my_rating_info['negative_comment'],
            "need_comment": need_comment 
            }

    def get_rating_info(self, document_id, user_id):
        response = self.es.search(
            index=config.TROUBLE_ES_INDEX_NAME,
            size=1,
            query={
                "nested": {
                "path": "_system_rated_users",
                "query": {
                    "bool": {
                        "must": [
                        {"match": {"_id": document_id}},
                        {"match": {"_system_rated_users.user": user_id}}
                        ]
                    }
                }
                }
            },
            _source=["_system_rated_users", "_system_rating"]
        )
        hits = [
            {
                'rated_users': row['_source']['_system_rated_users'] if '_system_rated_users' in row['_source'] else [],
                'rating': row['_source']['_system_rating'] if '_system_rating' in row['_source'] else 0,
            }
            for row in response['hits']['hits']
        ]
        return hits
  
    def get_rating_info_by_document_id(self, document_id):
        response = self.es.search(
            index=config.TROUBLE_ES_INDEX_NAME,
            size=1,
            query={
                "terms": {
                "_id": [ document_id ]
                }
            },
            _source=["_system_rated_users", "_system_rating"]
        )
        hits = [
            {
                'rated_users': row['_source']['_system_rated_users'] if '_system_rated_users' in row['_source'] else [],
                'rating': row['_source']['_system_rating'] if '_system_rating' in row['_source'] else 0,
            }
            for row in response['hits']['hits']
        ]
        return hits

    def update_rating(self, document_id, rated_users, rating):
        body = {'doc': {
            '_system_rated_users': rated_users,
            '_system_rating': rating
        }}
        return self.es.update(
            index=config.TROUBLE_ES_INDEX_NAME,
            id=document_id,
            body=body
        )
    
    def update_rated_users(self, document_id, rated_users):
        body = {'doc': {
            '_system_rated_users': rated_users
        }}
        return self.es.update(
            index=config.TROUBLE_ES_INDEX_NAME,
            id=document_id,
            body=body
        )
    
    def extended_stats_rating(self):
        response = self.es.search(
            index=config.TROUBLE_ES_INDEX_NAME,
            body={
                "size": 0,
                "aggs": { 
                    "extended_stats_rating": {
                        "extended_stats": {
                            "field": "_system_rating"
                        }
                    }
                }
            }
        )
        return response.get('aggregations', {}).get('extended_stats_rating', {})
    
    def user_rating_to_excel(self):
        try:
            if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):
                data = {
                    "id": [],
                    "user": [],
                    "user_name": [],
                    "positive": [],
                    "negative": [],
                    "comment": [],
                    "rating": [],
                    "trouble": [],
                    "cause": [],
                    "response": []
                }
                results = helpers.scan(
                    client=self.es,
                    index=config.TROUBLE_ES_INDEX_NAME,
                    query={"query": {
                        "nested": {
                            "path": "_system_rated_users",
                            "query": {
                                "bool": {
                                    "should": [
                                        { "term": { "_system_rated_users.negative": True } },
                                        { "term": { "_system_rated_users.positive": True } }
                                    ],
                                    "minimum_should_match" : 1
                                }
                            }
                        }
                    }},
                    size=500,
                    scroll='1m',
                    _source_includes=['trouble', 'cause', 'response', '_system_rated_users', '_system_rating']
                )

                for item in results:
                    rated_users = item['_source']['_system_rated_users'] if '_system_rated_users' in item['_source'] else []
                    rating = item['_source']['_system_rating'] if '_system_rating' in item['_source'] else 0
                    for rated_user in rated_users:
                        comment = rated_user['negative_comment'] if rated_user['negative'] else rated_user['positive_comment']
                        data['id'].append(item['_id'])
                        data['user'].append(rated_user['user'])
                        data['user_name'].append(rated_user['user_name'])
                        data['positive'].append(rated_user['positive'])
                        data['negative'].append(rated_user['negative'])
                        data['comment'].append(comment)
                        data['rating'].append(rating)
                        data['trouble'].append(item['_source']['trouble'])
                        data['cause'].append(item['_source']['cause'])
                        data['response'].append(item['_source']['response'])
                
                df = pd.DataFrame(data)
                df['positive'] = df['positive'].astype(int)
                df['negative'] = df['negative'].astype(int)
                
                buffer = io.BytesIO()
                with pd.ExcelWriter(buffer) as writer:
                    df.to_excel(writer, index=False)
                return io.BytesIO(buffer.getvalue())
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.TROUBLE_ES_INDEX_NAME)) 
        except:
            raise

    def user_rating_history_to_excel(self, bot_name, tz_offset):
        try:
            data = {
                "user": [],
                "user_name": [],
                "channel": [],
                "post_text": [],
                "post_date": [],
                "rated_date": [],
                "doc_id": [],
                "score": [],
                "trouble": [],
                "cause": [],
                "response": [],
                "positive": [],
                "negative": [],
                "comment": [],
                "rating_score": []
            }
            filter = {'$and':[{'$or':[{'recommends.rated_users.positive':True},{'recommends.rated_users.negative':True}]},{'bot':bot_name}]}
            histories = self.mongo_client.app.histories.find(filter).sort([("updatedAt", pymongo.ASCENDING),("createdAt", pymongo.ASCENDING)])
            for history in histories:
                for recommend in history['recommends']:
                    for rated_user in recommend['rated_users']:
                        if history['user'] == rated_user['user'] and (rated_user['positive'] == True or rated_user['negative'] == True):
                            post_date = history['createdAt'] + datetime.timedelta(seconds=tz_offset) if tz_offset > 0 else history['createdAt'] - datetime.timedelta(seconds=abs(tz_offset))
                            rated_date = history['updatedAt'] + datetime.timedelta(seconds=tz_offset) if tz_offset > 0 else history['updatedAt'] - datetime.timedelta(seconds=abs(tz_offset))
                            comment = rated_user['negative_comment'] if rated_user['negative'] else rated_user['positive_comment']
                            data['user'].append(rated_user['user'])
                            data['user_name'].append(rated_user['user_name'])
                            data['channel'].append(history['channel'])
                            data['post_text'].append(history['text'])
                            data['post_date'].append(post_date)
                            data['rated_date'].append(rated_date)
                            data['doc_id'].append(recommend['document_id'])
                            data['score'].append(recommend['score'])
                            data['trouble'].append(recommend['trouble'])
                            data['cause'].append(recommend['cause'])
                            data['response'].append(recommend['response'])
                            data['positive'].append(rated_user['positive'])
                            data['negative'].append(rated_user['negative'])
                            data['comment'].append(comment)
                            data['rating_score'].append(recommend['rating'])


            df = pd.DataFrame(data)
            df['positive'] = df['positive'].astype(int)
            df['negative'] = df['negative'].astype(int)
            
            buffer = io.BytesIO()
            with pd.ExcelWriter(buffer) as writer:
                df.to_excel(writer, index=False)
            return io.BytesIO(buffer.getvalue())
        except:
            raise

    def delete_user_rating(self, bot_name):
        try:
            if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):

                results = helpers.scan(
                    client=self.es,
                    index=config.TROUBLE_ES_INDEX_NAME,
                    query={"query": { "match_all" : {} }},
                    size=500,
                    scroll='1m',
                    _source_includes=['_system_rated_users', '_system_rating']
                )
                # reset _system_rated_users and _system_rating
                for item in results:
                    change_doc = {"doc": {"_system_rated_users": [], "_system_rating": 0}}
                    self.es.update(index=config.TROUBLE_ES_INDEX_NAME, body=change_doc, id=item['_id'])

                # delete histories from mongodb
                self.mongo_client.app.histories.delete_many({'bot':bot_name})
                return {"ok": True}
            else:
                raise IndexNotFoundException("es index: {} not found.".format(config.TROUBLE_ES_INDEX_NAME)) 
        except:
            raise