# -*- coding: utf-8 -*-
import os
ES_INDEX_NAME = os.getenv('ES_INDEX_NAME')
TARGET_DIRECTORY = os.getenv('TARGET_DIRECTORY')
TOPPAGE_ONLY = os.getenv('TOPPAGE_ONLY')
MAPPING_JSON_PATH = os.getenv('MAPPING_JSON_PATH')
SETTING_JSON_PATH = os.getenv('SETTING_JSON_PATH')

# ElasticSearch Container's EndPoint
ES_ENDPOINT='http://elasticsearch:9200'

# ELECTRA based. for spacy
SPACY_MODEL = 'ja_ginza_electra'

BULK_MAX_DOCS = 1000
RESERVED_PROPERTY_FILENAME = '_system_filename'