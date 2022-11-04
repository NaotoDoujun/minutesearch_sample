# -*- coding: utf-8 -*-
import nkf
import mojimoji
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
      return str(text)
    if not text: 
      return text
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

  def read(self, file):
    self.logger.info("processing read() {}".format(file))
    skiprows = None if config.SKIP_ROWS == None else [int(s) for s in config.SKIP_ROWS.split(",")]
    usecols = None if config.USE_COLS == None else [int(s) for s in config.USE_COLS.split(",")]
    df_sheet = pd.read_excel(file, sheet_name=0, skiprows=skiprows, usecols=usecols, 
      header=None, names=['trouble', 'cause', 'response'])
    results = []
    for row in df_sheet.itertuples():
      trouble = mojimoji.zen_to_han(mojimoji.han_to_zen(self.change_charset(row.trouble), digit=False, ascii=False), kana=False)
      cause = mojimoji.zen_to_han(mojimoji.han_to_zen(self.change_charset(row.cause), digit=False, ascii=False), kana=False)
      response = mojimoji.zen_to_han(mojimoji.han_to_zen(self.change_charset(row.response), digit=False, ascii=False), kana=False)
      results.append({
        'trouble': trouble,  
        'trouble_vector': self.to_vector(trouble), 
        'cause': cause, 
        'response': response
        })
    return results