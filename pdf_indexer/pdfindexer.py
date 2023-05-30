# -*- coding: utf-8 -*-
import json, sys, hashlib, datetime
from elasticsearch import Elasticsearch, helpers
from logging import getLogger, NullHandler, INFO
import ocr
import config

class PdfIndexer:

  def __init__(self, name=__name__):
    self.logger = getLogger(name)
    self.logger.addHandler(NullHandler())
    self.logger.setLevel(INFO)
    self.logger.propagate = True
    self.es = Elasticsearch(config.ES_ENDPOINT, request_timeout=100)

    self.reader = ocr.Ocr()

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
    self.logger.info("target index name is [{}]".format(index))
    if recreate and self.es.indices.exists(index=index):
      self.es.indices.delete(index=index)
      
    if not self.es.indices.exists(index=index):
      with open (setting_file_path) as fs:
        setting = json.load(fs)
        with open(mapping_file_path) as fm:
            mapping = json.load(fm)
            self.es.indices.create(index=index, mappings=mapping, settings=setting)

  def exists(self, index, id):
    """
    Check Target id document exists
    """
    return self.es.exists(index=index, id=id)

  def is_indexed(self, file):
    """
    Check the file indexed
    """
    pageslen = self.reader.get_page_count(file)
    is_indexed_file = False
    for page in range(1, pageslen):
      id = hashlib.md5("{}_{}".format(file, page).encode()).hexdigest()
      if self.exists(config.ES_INDEX_NAME, id):
        is_indexed_file = True
    return is_indexed_file

  def do_create(self, index, id, doc):
    """
    Create document
    """
    self.es.create(index=index, id=id, body=doc)
    print('\r *** create document done at {} ***'.format(datetime.datetime.now()))

  def do_bulk_import(self, import_data, count):
    """
    Bulk Import documents
    """
    size = sys.getsizeof(import_data)
    count += 1
    print('\r ****** bulk_import {} [{}] started at {} *****'.format(
        count, 
        self.convert_size(size, "KB"),
        datetime.datetime.now()))
    helpers.bulk(self.es, import_data)
    print('\r ****** bulk_import {} [{}]    done at {} *****'.format(
        count, 
        self.convert_size(size, "KB"), 
        datetime.datetime.now()))      
    return count
