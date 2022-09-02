# -*- coding: utf-8 -*-
import hashlib
import glob
import config
import pdfindexer
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
  logger.info('The root logger is created.')

  indexer = pdfindexer.PdfIndexer()

  indexer.make_es_index(index=config.ES_INDEX_NAME, 
    setting_file_path=config.SETTING_JSON_PATH, 
    mapping_file_path=config.MAPPING_JSON_PATH, 
    recreate=False)
  logger.info("target index name is {}".format(config.ES_INDEX_NAME))
  
  files = glob.glob("{}/*.pdf".format(config.TARGET_DIRECTORY))

  import_data, count, import_count = [], 1, 0
  for i, file in enumerate(files):
    results = indexer.reader.get_texts(file)
    for result in results:
      id = hashlib.md5("{}_{}".format(result['path'], result['page']).encode()).hexdigest()
      if not indexer.exists(config.ES_INDEX_NAME, id):
        import_data.append({'_index': config.ES_INDEX_NAME, '_id': id, '_source': result})
        if count % 1000 == 0:
          import_count = indexer.do_bulk_import(import_data, import_count)
          import_data, count = [], 1
        elif len(files) == i + 1 and len(import_data) > 1:
          import_count = indexer.do_bulk_import(import_data, import_count)
          import_data, count = [], 1
        elif len(files) == i + 1 and len(import_data) == 1:
          indexer.do_create(config.ES_INDEX_NAME, id, result)
        else:
          count += 1

if __name__ == "__main__":
  main()