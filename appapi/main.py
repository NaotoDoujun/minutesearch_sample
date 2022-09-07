# -*- coding: utf-8 -*-
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from recommender import MinuteRecommender, IndexNotFoundException

class Item(BaseModel):
    text: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

logger = logging.getLogger('uvicorn')
recommender = MinuteRecommender(logger)

@app.get("/")
def read_root():
    return {"Api": "app api"}

@app.get("/search/")
def input_search(id: str = None, param: str = None, size: int = None, start: int = None):
    try:
        return recommender.input_search(id, param, size, start)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/minutes_search/")
def minutes_search(item: Item, size: int = None, start: int = None):
    try:
        return recommender.minutes_search(item.text, size, start)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)