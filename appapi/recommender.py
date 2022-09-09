# -*- coding: utf-8 -*-
from elasticsearch import Elasticsearch
import spacy
import config

class IndexNotFoundException(Exception):
    def __init__(self, message):
        super().__init__(message)

class MinuteRecommender():

  TARGET_LABEL = "Conference"

  def __init__(self, logger):
    self.logger = logger
    self.nlp = spacy.load("ja_ginza_electra")
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