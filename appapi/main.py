# -*- coding: utf-8 -*-
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from recommender import (MinuteRecommender, TroubleShootRecommender, RateType,
                          IndexNotFoundException, DocumentNotFoundException, UserRateRecordFailedException)
from summarizer import SUMYSummarizer, AlgorithmName
from azureai import GPT35

class Item(BaseModel):
    text: str

class RatingItem(BaseModel):
    document_id: str
    user_id: str
    user_name: str
    rate_type: RateType

class CommentItem(BaseModel):
    document_id: str
    user_id: str 
    comment: str
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
gpt35 = GPT35(logger)

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
def troubles_search(item: Item, size: int = None, min_score: float = None, from_: int = None):
    try:
        return troubleshoot_recommender.troubles_search(item.text, size, min_score, from_)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/trouble_get_source/')
def trouble_get_source(id: str = None):
    try:
        return troubleshoot_recommender.get_source(id)
    except DocumentNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/trouble_user_rate/")
def trouble_user_rate(item: RatingItem):
    try:
        return troubleshoot_recommender.user_rate(item.document_id, item.user_id, item.user_name, item.rate_type)
    except DocumentNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UserRateRecordFailedException as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trouble_record_comment/")
def trouble_record_comment(item: CommentItem):
    try:
        return troubleshoot_recommender.record_comment(item.document_id, item.user_id, item.comment, item.rate_type)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UserRateRecordFailedException as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/trouble_user_rating_download/')
def trouble_user_rating_download():
    try:
        return StreamingResponse(troubleshoot_recommender.user_rating_to_excel(), 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={"Content-Disposition": 'attachment; filename="UserRating.xlsx"'})
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/trouble_user_ratig_history_download/')
def trouble_user_rating_history_download(bot_name: str = None, tz_offset: int = 0):
    try:
        return StreamingResponse(troubleshoot_recommender.user_rating_history_to_excel(bot_name, tz_offset), 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={"Content-Disposition": 'attachment; filename="UserRatingHistories.xlsx"'})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/trouble_user_operating_history_download/')
def trouble_user_operating_history_download(bot_name: str = None, tz_offset: int = 0):
    try:
        return StreamingResponse(troubleshoot_recommender.user_operating_history_to_excel(bot_name, tz_offset), 
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={"Content-Disposition": 'attachment; filename="UserOperatingHistories.xlsx"'})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete('/trouble_user_rating_delete/')
def trouble_user_rating_delete(bot_name: str = None):
    try:
        return troubleshoot_recommender.delete_user_rating(bot_name)
    except IndexNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/text_summarize/{algorithm}")
def text_summarize(item: Item, algorithm: AlgorithmName):
    try:
        return text_summarizer.summarize(text=item.text, algorithm=algorithm.value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gpt35_chat/")
def gpt35_chat(item: Item):
    try:
        return gpt35.chat(message=item.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)