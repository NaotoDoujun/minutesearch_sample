# -*- coding: utf-8 -*-
import uvicorn
import logging
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import Elasticsearch
import spacy

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

nlp = spacy.load("ja_ginza_electra")

logger = logging.getLogger('uvicorn')
es = Elasticsearch("http://elasticsearch:9200", request_timeout=100)

class Item(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"Api": "app api"}

@app.get("/search/")
def pdfdoc_search(id: str = None):
    q = {"match_all": {}}
    if id:
      q = {"term": {"_id": id}}
    response = es.search(
        index="pdfdoc", 
        query=q
    )
    results = [
        {
            'id': row['_id'],
            'page': row['_source']['page'], 
            'text': row['_source']['text'], 
            'image': row['_source']['image'],
            'filename': row['_source']['filename'], 
            'path': row['_source']['path'], 
            'score': row['_score'],
        }
        for row in response['hits']['hits']
    ]
    return results

@app.post("/minutes_search/")
def minutes_search(item: Item):
    search_words = []
    doc = nlp(item.text)
    for ent in doc.ents:
        print(ent.text, ent.label_, ent.start_char, ent.end_char)
        if ent.label_ == 'Conference' or ent.label_ == 'Date':
            search_words.append(ent.text)

    response = es.search(
        index="minutes",
        size=3,
        query={
          "match": {
            "text": ' '.join(search_words)
          }
        }
    )
    results = [
        {
            'id': row['_id'],
            'page': row['_source']['page'], 
            'text': row['_source']['text'], 
            'image': row['_source']['image'],
            'filename': row['_source']['filename'], 
            'path': row['_source']['path'], 
            'score': row['_score'],
        }
        for row in response['hits']['hits']
    ]

    return results
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)