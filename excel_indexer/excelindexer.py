# -*- coding: utf-8 -*-
import json, sys, datetime
from elasticsearch import Elasticsearch, helpers
from logging import getLogger, NullHandler, INFO
import config
import reader

class ExcelIndexer:

  def __init__(self, name=__name__):
    self.logger = getLogger(name)
    self.logger.addHandler(NullHandler())
    self.logger.setLevel(INFO)
    self.logger.propagate = True
    self.es = Elasticsearch(config.ES_ENDPOINT, request_timeout=100)

    self.reader = reader.Reader()

  def convert_size(self, size, unit="B"):
    """
    Convert Size
    """
    units = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB")
    i = units.index(unit.upper())
    size = round(size / 1024 ** i, 2)
    return f"{size} {units[i]}"

  def make_es_index(self, index, setting_file_path, mapping_file_path, recreate=False):
    """
    Make Elasticsearch Index
    """
    self.logger.info("target index name: {}".format(index))
    if recreate and self.es.indices.exists(index=index):
      self.es.indices.delete(index=index)
      
    if not self.es.indices.exists(index=index):
      with open (setting_file_path) as fs:
        setting = json.load(fs)
        with open(mapping_file_path) as fm:
            mapping = json.load(fm)
            mapping['properties'][config.RESERVED_PROPERTY_FILENAME] = {"type": "keyword"}
            self.es.indices.create(index=index, mappings=mapping, settings=setting)

  def indices_exists(self, index):
    """
    Check Target index exists
    """
    return self.es.indices.exists(index=index)

  def exists(self, index, id):
    """
    Check Target id document exists
    """
    return self.es.exists(index=index, id=id)

  def get_source(self, index, id):    
    """
    Get Target id document
    """
    return self.es.get_source(index=index, id=id)
  
  def update(self, index, id, body):
    """
    Update Target id document
    """
    return self.es.update(index=index, id=id, body=body)

  def delete(self, index, id):
    """
    Delete Target id document
    """
    return self.es.delete(index=index, id=id)

  def do_create(self, index, id, doc):
    """
    Create document
    """
    self.es.create(index=index, id=id, body=doc)
    self.logger.info('*** create document done at {} ***'.format(datetime.datetime.now()))

  def do_delete_by_query(self, index, query):
    """
    Delete documents by query
    """
    return self.es.delete_by_query(index=index, body={'query': query})

  def do_bulk_import(self, import_data, count):
    """
    Bulk Import documents
    """
    size = sys.getsizeof(import_data)
    count += 1
    self.logger.info('****** bulk_import {} [{}] started *****'.format(
        count, 
        self.convert_size(size, "KB")))
    helpers.bulk(self.es, import_data)
    self.logger.info('****** bulk_import {} [{}]    done *****'.format(
        count, 
        self.convert_size(size, "KB")))    
    return count
