# -*- coding: utf-8 -*-
import os
ES_INDEX_NAME = os.getenv('ES_INDEX_NAME')
TARGET_DIRECTORY = os.getenv('TARGET_DIRECTORY')
MAPPING_JSON_PATH = os.getenv('MAPPING_JSON_PATH')
SETTING_JSON_PATH = os.getenv('SETTING_JSON_PATH')
HEADER_MAPPING = os.getenv('HEADER_MAPPING')
DATA_MAPPING = os.getenv('DATA_MAPPING')
EMBEDDING_COLUMNS = os.getenv('EMBEDDING_COLUMNS')

# ElasticSearch Container's EndPoint
ES_ENDPOINT='http://elasticsearch:9200'

# Sentence-BERT based. for sentence_transformers
SENTENCE_MODEL = 'stsb-xlm-r-multilingual'

DATA_START_ROW = 2
BULK_MAX_DOCS = 1000
RESERVED_PROPERTY_FILENAME = '_system_filename'