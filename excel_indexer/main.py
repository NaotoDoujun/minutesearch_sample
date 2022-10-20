# -*- coding: utf-8 -*-
import hashlib, glob
import config
import excelindexer
from logging import Formatter, getLogger, StreamHandler, DEBUG, WARNING
import warnings
warnings.filterwarnings('ignore')

def main():
  logger = getLogger()
  handler = StreamHandler()
  handler.setLevel(DEBUG)
  handler.setFormatter(Formatter('[%(name)s] %(message)s'))
  logger.addHandler(handler)
  logger.setLevel(WARNING)
  logger.debug('The root logger is created.')

  indexer = excelindexer.ExcelIndexer()

  indexer.make_es_index(index=config.ES_INDEX_NAME, 
    setting_file_path=config.SETTING_JSON_PATH, 
    mapping_file_path=config.MAPPING_JSON_PATH, 
    recreate=False)
  logger.info("target index name is {}".format(config.ES_INDEX_NAME))
  
  files = glob.glob("{}/*.xlsx".format(config.TARGET_DIRECTORY))

  import_data, data_count, import_count = [], 1, 0
  for i, file in enumerate(files):
    results = indexer.reader.read(file)
    for j, result in enumerate(results):
      id = hashlib.md5("{}_sheet0_row{}".format(file, j).encode()).hexdigest()
      if not indexer.exists(config.ES_INDEX_NAME, id):
        import_data.append({'_index': config.ES_INDEX_NAME, '_id': id, '_source': result})
        if data_count % 1000 == 0:
          import_count = indexer.do_bulk_import(import_data, import_count)
          import_data, data_count = [], 1
        else:
          data_count += 1

        if i == len(files) - 1 and j == len(results) - 1:
          if len(import_data) == 1:
            indexer.do_create(config.ES_INDEX_NAME, id, result)
          else:
            if len(import_data) > 1:
              import_count = indexer.do_bulk_import(import_data, import_count)
      else:
        if i == len(files) - 1:
          if len(import_data) == 1:
            id = import_data[0]['_id']
            result = import_data[0]['_source']
            indexer.do_create(config.ES_INDEX_NAME, id, result)
          else:
            if len(import_data) > 1:
              import_count = indexer.do_bulk_import(import_data, import_count)

if __name__ == "__main__":
  main()