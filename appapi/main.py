# -*- coding: utf-8 -*-
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from recommender import (MinuteRecommender, TroubleShootRecommender, RateType,
                          IndexNotFoundException, DocumentNotFoundException, UserRateRecordFailedException)
from summarizer import SUMYSummarizer, AlgorithmName

class Item(BaseModel):
    text: str

class RatingItem(BaseModel):
    document_id: str
    user_id: str
    rate_type: RateType

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

logger = logging.getLogger('uvicorn')
minute_recommender = MinuteRecommender(logger)
troubleshoot_recommender = TroubleShootRecommender(logger)
text_summarizer = SUMYSummarizer(logger)

@app.get("/")
def read_root():
    return {"Api": "app api"}

@app.get("/search/")
def input_search(id: str = None, param: str = None, size: int = None, start: int = None):
    try:
        return minute_recommender.input_search(id, param, size, start)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/minutes_search/")
def minutes_search(item: Item, size: int = None, start: int = None):
    try:
        return minute_recommender.minutes_search(item.text, size, start)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/troubles_search/")
def troubles_search(item: Item, size: int = None, min_score: float = None):
    try:
        return troubleshoot_recommender.troubles_search(item.text, size, min_score)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/trouble_user_rate/")
def trouble_user_rate(item: RatingItem):
    try:
        return troubleshoot_recommender.user_rate(item.document_id, item.user_id, item.rate_type)
    except DocumentNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UserRateRecordFailedException as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/text_summarize/{algorithm}")
def text_summarize(item: Item, algorithm: AlgorithmName):
    try:
        return text_summarizer.summarize(text=item.text, algorithm=algorithm.value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)