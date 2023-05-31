# -*- coding: utf-8 -*-
import os
from dataclasses import dataclass, field
from typing import List
from dataclasses_json import dataclass_json
from logging import getLogger, NullHandler, INFO
import config

@dataclass_json
@dataclass
class File:
  name: str
  data_rows: int

@dataclass_json
@dataclass
class Files:
  files: List[File] = field(default_factory=list)

class Store:

  def __init__(self, name=__name__):
    self.logger = getLogger(name)
    self.logger.addHandler(NullHandler())
    self.logger.setLevel(INFO)
    self.logger.propagate = True

  def load(self) -> Files:
    path = os.path.join(config.STORE_DIR, "{}_files.json".format(config.ES_INDEX_NAME))
    if os.path.exists(path):
      with open(path) as f:
        data = Files.from_json(f.read())
        self.logger.info("load file info from store: {}".format(data))
        return data
    else:
      return Files()
  
  def save(self, data: Files):
    path = os.path.join(config.STORE_DIR, "{}_files.json".format(config.ES_INDEX_NAME))
    with open(path, 'w') as f:
      f.write(data.to_json(indent=4, ensure_ascii=False))
      self.logger.info("save file info to store: {}".format(data))
    return
