# -*- coding: utf-8 -*-
import os
import json
from logging import getLogger, NullHandler, INFO
import config

class Store:

  def __init__(self, name=__name__):
    self.logger = getLogger(name)
    self.logger.addHandler(NullHandler())
    self.logger.setLevel(INFO)
    self.logger.propagate = True

  def load(self):
    path = os.path.join(config.STORE_DIR, "{}_files.json".format(config.ES_INDEX_NAME))
    if os.path.exists(path):
      with open(path) as f:
        data = json.load(f)
        self.logger.info("load data from file store: {}".format(data))
        return data
    else:
      return []
  
  def save(self, data):
    path = os.path.join(config.STORE_DIR, "{}_files.json".format(config.ES_INDEX_NAME))
    json_string = json.dumps(data)
    with open(path, 'w') as f:
      f.write(json_string)
      self.logger.info("save data to file store: {}".format(json_string))
    return
