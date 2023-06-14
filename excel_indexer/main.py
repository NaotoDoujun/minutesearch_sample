# -*- coding: utf-8 -*-
import os
import hashlib, glob
import config
import excelindexer
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

  indexer = excelindexer.ExcelIndexer()

  try:

    indexer.make_es_index(index=config.ES_INDEX_NAME, recreate=False)
 
    files = glob.glob("{}/*.xlsx".format(config.TARGET_DIRECTORY))

    # delete removed file's docs
    buckets = indexer.group_by_filename(config.ES_INDEX_NAME)
    for bucket in buckets:
      filename = bucket.get('key')
      if os.path.join(config.TARGET_DIRECTORY, filename) not in files:
        response = indexer.do_delete_by_query(config.ES_INDEX_NAME, query={"term": {config.RESERVED_PROPERTY_FILENAME: filename}})
        logger.warning("file:{} removed. related {} documents have also been removed.".format(filename, response['deleted']))
        
    # import existing file's docs
    mapping = indexer.reader.get_mapping_json()
    import_data, import_count = [], 0
    for i, file in enumerate(files):
      try:
        results = indexer.reader.read(file, mapping)

        # delete removed rows
        existed_file = [ bk for bk in buckets if os.path.join(config.TARGET_DIRECTORY, bk.get('key', '')) == file ]
        if len(existed_file) > 0:
          if existed_file[0].get('doc_count', 0) > len(results):
            for x in reversed(range(len(results), existed_file[0]['doc_count'])):
              id = hashlib.md5("{}_sheet0_row{}".format(file, x + config.DATA_START_ROW).encode()).hexdigest()
              indexer.delete(config.ES_INDEX_NAME, id)
              logger.warning("excel_row:{} removed. user rating gone.".format(x + config.DATA_START_ROW))

        # import or update
        for j, result in enumerate(results, config.DATA_START_ROW):
          id = hashlib.md5("{}_sheet0_row{}".format(file, j).encode()).hexdigest()
          if not indexer.exists(config.ES_INDEX_NAME, id):
            import_data.append({'_index': config.ES_INDEX_NAME, '_id': id, '_source': indexer.reader.embedding_format(result, mapping)})
            if len(import_data) % config.BULK_MAX_DOCS == 0:
              logger.info("do bulk cuz import_data reached {}".format(config.BULK_MAX_DOCS))
              import_count = indexer.do_bulk_import(import_data, import_count)
              import_data = []
          else:
            doc = indexer.get_source(config.ES_INDEX_NAME, id)
            if not indexer.reader.is_same(doc, result):
              body = {'doc': indexer.reader.embedding_format(result, mapping)}
              indexer.update(config.ES_INDEX_NAME, id, body)
              logger.warning("excel_row:{} updated. user rating gone.".format(j))
      
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