# -*- coding: utf-8 -*-
import json
import nkf
import mojimoji
from jsonmerge import merge
import pandas as pd
from sentence_transformers import SentenceTransformer
from logging import getLogger, NullHandler, INFO
import config

class Reader:

  def __init__(self, name=__name__):
    self.logger = getLogger(name)
    self.logger.addHandler(NullHandler())
    self.logger.setLevel(INFO)
    self.logger.propagate = True
    self.model = SentenceTransformer(config.SENTENCE_MODEL)

  def change_charset(self, text, output_encode = 'utf-8'):
    if type(text) is not str:
      return ''
    if not text: 
      return ''
    input_encode = nkf.guess(text).lower()
    if input_encode == output_encode.lower():
      return text
    else:
      if output_encode.lower() == 'utf-8':
        if input_encode == 'shift_jis':
          return nkf.nkf('-Sw', text)
        elif input_encode == 'euc-jp':
          return nkf.nkf('-Ew', text)
      elif output_encode.lower() == 'shift_jis':
        if input_encode == 'utf-8':
          return nkf.nkf('-Ws', text)
        elif input_encode == 'euc-jp':
          return nkf.nkf('-Es', text)
      elif output_encode.lower() == 'euc-jp':
        if input_encode == 'shift_jis':
          return nkf.nkf('-Se', text)
        elif input_encode == 'utf-8':
          return nkf.nkf('-We', text)
      else:
        return text

  def to_vector(self, sentence):
    return self.model.encode(sentence)

  def header_format(self, row, header_mapping, mapping):
    format = {}
    if header_mapping is not None:
      for key in header_mapping.keys():
        if key in mapping['properties']:
          index = int(header_mapping.get(key)) + 1
          format[key] = mojimoji.zen_to_han(mojimoji.han_to_zen(self.change_charset(row[index]), digit=False, ascii=False), kana=False)
        else:
          raise ValueError("property {} not exist on mapping.json.".format(key))
    return format

  def data_format(self, row, data_mapping, embedding_columns, mapping):
    format = {}
    if data_mapping is not None:
      for key in data_mapping.keys():
        if key in mapping['properties']:
          index = int(data_mapping.get(key)) + 1
          format[key] = mojimoji.zen_to_han(mojimoji.han_to_zen(self.change_charset(row[index]), digit=False, ascii=False), kana=False)
        else:
          raise ValueError("property {} not exist on mapping.json.".format(key))
    if embedding_columns is not None:
      for key in embedding_columns.keys():
        if key in mapping['properties']:
          index = int(embedding_columns.get(key)) + 1
          format[key] = self.to_vector(mojimoji.zen_to_han(mojimoji.han_to_zen(self.change_charset(row[index]), digit=False, ascii=False), kana=False))
        else:
          raise ValueError("property {} not exist on mapping.json.".format(key))
    return format

  def read(self, file):
    self.logger.info("processing read() {}".format(file))
    results =[]
    try:
      with open (config.MAPPING_JSON_PATH) as f:
        mapping = json.load(f)
        header_mapping = None if config.HEADER_MAPPING == None else json.loads(config.HEADER_MAPPING)
        data_mapping = None if config.DATA_MAPPING == None else json.loads(config.DATA_MAPPING)
        embedding_columns = None if config.EMBEDDING_COLUMNS == None else json.loads(config.EMBEDDING_COLUMNS)
        df_sheet = pd.read_excel(file, sheet_name=0, header=None, index_col=None)
        header = {}
        for i, row in enumerate(df_sheet.itertuples()): #itertuples contains Index
          if i == 0:
            header = self.header_format(row, header_mapping=header_mapping, mapping=mapping)
          else:
            data = self.data_format(row, data_mapping=data_mapping, embedding_columns=embedding_columns, mapping=mapping)
            results.append(merge(header, data))
    except Exception as e:
      self.logger.error(e)
    return results