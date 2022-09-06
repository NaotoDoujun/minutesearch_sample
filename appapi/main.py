# -*- coding: utf-8 -*-
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
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

def str_multi2single(text):
    result = text.lower().translate(str.maketrans({chr(0xFF01 + i): chr(0x21 + i) for i in range(94)}))
    return ''.join(result.split())

@app.get("/")
def read_root():
    return {"Api": "app api"}

@app.get("/search/")
def pdfdoc_search(id: str = None):
    try:
        if es.indices.exists(index="pdfdoc"):
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
                    'tags': row['_source']['tags'],
                    'image': row['_source']['image'],
                    'filename': row['_source']['filename'], 
                    'path': row['_source']['path'], 
                    'score': row['_score'],
                }
                for row in response['hits']['hits']
            ]
            return results
        else:
            raise HTTPException(status_code=404, detail="es index pdfdoc not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)

@app.post("/minutes_search/")
def minutes_search(item: Item):
    try:
        if es.indices.exists(index="minutes"):
            doc = nlp(item.text)
            search_words = [str_multi2single(ent.text) for ent in doc.ents if ent.label_ == "Conference"]
            print(search_words)
            response = es.search(
                index="minutes",
                size=3,
                query={
                "match": {
                    "tags": ' '.join(search_words)
                }
                }
            )
            results = [
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

            return results
        else:
            raise HTTPException(status_code=404, detail="es index minutes not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)