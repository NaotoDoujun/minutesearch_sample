# -*- coding: utf-8 -*-
from elasticsearch import Elasticsearch
import mojimoji
import spacy
from sentence_transformers import SentenceTransformer
import config

class IndexNotFoundException(Exception):
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
            raise IndexNotFoundException("es index {} not found.".format(config.INPUT_ES_INDEX_NAME))
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
            raise IndexNotFoundException("es index {} not found.".format(config.MINUTE_ES_INDEX_NAME))
    except:
        raise

class TroubleShootRecommender():
    
  def __init__(self, logger):
    self.logger = logger
    self.model = SentenceTransformer(config.SENTENCE_MODEL)
    self.es = Elasticsearch(config.ES_ENDPOINT, request_timeout=100)

  def troubles_search(self, text, size = 10, min_score = 1.6):
    try:
        if self.es.indices.exists(index=config.TROUBLE_ES_INDEX_NAME):
            query = mojimoji.zen_to_han(mojimoji.han_to_zen(text, digit=False, ascii=False), kana=False)
            embedding = self.model.encode(query)
            script_query = {
                "script_score": {
                     "query": {
                        "match": {
                            "trouble": query
                        }
                    },
                    "script": {
                        "source": "(_score + (cosineSimilarity(params.query_vector, 'trouble_vector') + 1.0))/2",
                        "params": {"query_vector": embedding}
                    }
                }
            }
            response = self.es.search(
                index=config.TROUBLE_ES_INDEX_NAME,
                size=size,
                min_score=min_score,
                query=script_query
            )
            total = response['hits']['total']
            hits = [
                {
                    'trouble_header': row['_source']['trouble_header'],
                    'cause_header': row['_source']['cause_header'],
                    'response_header': row['_source']['response_header'],
                    'trouble': row['_source']['trouble'], 
                    'cause': row['_source']['cause'], 
                    'response': row['_source']['response'],
                    'score': row['_score'],
                }
                for row in response['hits']['hits']
            ]
            return {"total": total, "hits": hits}
        else:
            raise IndexNotFoundException("es index {} not found.".format(config.TROUBLE_ES_INDEX_NAME))    
    except:
        raise