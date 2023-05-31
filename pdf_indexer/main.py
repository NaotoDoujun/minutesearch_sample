# -*- coding: utf-8 -*-
import os
import hashlib
import glob
import config
import pdfindexer
from logging import Formatter, getLogger, StreamHandler, DEBUG, WARN
import warnings
warnings.filterwarnings('ignore')

def main():
  logger = getLogger()
  handler = StreamHandler()
  handler.setLevel(DEBUG)
  handler.setFormatter(Formatter('%(asctime)s %(levelname)s [%(name)s] %(message)s'))
  logger.addHandler(handler)
  logger.setLevel(WARN)
  logger.debug('The root logger is created.')

  indexer = pdfindexer.PdfIndexer()

  try:

    indexer.make_es_index(index=config.ES_INDEX_NAME, 
      setting_file_path=config.SETTING_JSON_PATH, 
      mapping_file_path=config.MAPPING_JSON_PATH, 
      recreate=False)
    
    files = glob.glob("{}/*.pdf".format(config.TARGET_DIRECTORY))

    # delete removed file's docs
    buckets = indexer.group_by_filename(config.ES_INDEX_NAME)
    for bucket in buckets:
      filename = bucket.get('key')
      if os.path.join(config.TARGET_DIRECTORY, filename) not in files:
        response = indexer.do_delete_by_query(config.ES_INDEX_NAME, query={"term": {config.RESERVED_PROPERTY_FILENAME: filename}})
        logger.warning("file:{} removed. related {} documents have also been removed.".format(filename, response['deleted']))   

    import_data, import_count = [], 0
    for i, file in enumerate(files):
      try:
        if not indexer.is_indexed(config.ES_INDEX_NAME, file):
          results = indexer.reader.get_texts(file)
          for result in results:
            id = hashlib.md5("{}_{}".format(file, result["page"]).encode()).hexdigest()
            import_data.append({'_index': config.ES_INDEX_NAME, '_id': id, '_source': result})
            if len(import_data) % config.BULK_MAX_DOCS == 0:
              logger.info("do bulk cuz import_data reached {}".format(config.BULK_MAX_DOCS))
              import_count = indexer.do_bulk_import(import_data, import_count)
              import_data = []
          
          if i == len(files) - 1:
            if len(import_data) == 1:
              logger.info("ceate 1 doc only.")
              id = import_data[0]['_id']
              result = import_data[0]['_source']
              indexer.do_create(config.ES_INDEX_NAME, id, result)
            elif len(import_data) > 1:
              logger.info("do bulk cuz its final file. import_data len is {}".format(len(import_data)))
              import_count = indexer.do_bulk_import(import_data, import_count)

      except Exception as e:
        logger.error(e)
        continue
    
  except Exception as e:
    logger.error(e)

if __name__ == "__main__":
  main()