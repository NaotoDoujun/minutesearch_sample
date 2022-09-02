# -*- coding: utf-8 -*-
import os
ES_INDEX_NAME = os.getenv('ES_INDEX_NAME')
TARGET_DIRECTORY = os.getenv('TARGET_DIRECTORY')
MAPPING_JSON_PATH = os.getenv('MAPPING_JSON_PATH')
SETTING_JSON_PATH = os.getenv('SETTING_JSON_PATH')
ES_ENDPOINT='http://elasticsearch:9200'