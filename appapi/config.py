# -*- coding: utf-8 -*-
from dotenv import load_dotenv
import os

load_dotenv()

ES_ENDPOINT='http://elasticsearch:9200'
INPUT_ES_INDEX_NAME='pdfdoc'
MINUTE_ES_INDEX_NAME='minutes'
TROUBLE_ES_INDEX_NAME='troubles'

# mongodb
MONGODB_HOST='mongodb:27017'

# trouble search score ratio
TROUBLE_FULL_TEXT_RATIO=float(os.getenv('TROUBLE_FULL_TEXT_RATIO', '1.0'))
TROUBLE_EMBEDDINGS_RATIO=float(os.getenv('TROUBLE_EMBEDDINGS_RATIO', '1.0'))
TROUBLE_USER_RATING_RATIO=float(os.getenv('TROUBLE_USER_RATING_RATIO', '0.2'))

# Spacy Eng Model
SPACY_EN_MODEL = 'en_core_web_sm'

# ELECTRA based GiNZA
GINZA_MODEL = 'ja_ginza_electra'

# Sentence-BERT based. for sentence_transformers
SENTENCE_MODEL = 'stsb-xlm-r-multilingual'

# Azure OPENAI
OPENAI_API_KEY=os.getenv('OPENAI_API_KEY')
OPENAI_API_ENDPOINT=os.getenv('OPENAI_API_ENDPOINT')
OPENAI_API_TYPE=os.getenv('OPENAI_API_TYPE', 'azure')
OPENAI_API_VERSION=os.getenv('OPENAI_API_VERSION')