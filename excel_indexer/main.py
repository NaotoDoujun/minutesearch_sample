# -*- coding: utf-8 -*-
import os
import json
import hashlib, glob
import config
import excelindexer
from store import Store, Files, File
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
  file_store = Store()
  store_files = Files()

  try:

    if not indexer.indices_exists(config.ES_INDEX_NAME):
      file_store.delete(config.ES_INDEX_NAME) 

    indexer.make_es_index(index=config.ES_INDEX_NAME, 
      setting_file_path=config.SETTING_JSON_PATH, 
      mapping_file_path=config.MAPPING_JSON_PATH, 
      recreate=False)
 
    files = glob.glob("{}/*.xlsx".format(config.TARGET_DIRECTORY))

    # delete removed file's docs
    existed_files = file_store.load(config.ES_INDEX_NAME)
    for existed_file in existed_files.files:
      if existed_file.name not in files:
        basename = os.path.basename(existed_file.name)
        response = indexer.do_delete_by_query(config.ES_INDEX_NAME, query={"term": {config.RESERVED_PROPERTY_FILENAME: basename}})
        logger.warning("file:{} removed. related {} documents have also been removed.".format(basename, response['deleted']))

    # import existing file's docs
    with open (config.MAPPING_JSON_PATH) as f:
      mapping = json.load(f)
      mapping['properties'][config.RESERVED_PROPERTY_FILENAME] = {"type": "keyword"}
      
      import_data, import_count = [], 0
      for i, file in enumerate(files):
        try:
          results = indexer.reader.read(file, mapping)
          store_files.files.append(File(file, len(results)))

          # delete removed rows
          existed_file = [ ex for ex in existed_files.files if ex.name == file ]
          if len(existed_file) > 0:
            if existed_file[0].data_rows > len(results):
              for x in reversed(range(len(results), existed_file[0].data_rows)):
                id = hashlib.md5("{}_sheet0_row{}".format(file, x + config.DATA_START_ROW).encode()).hexdigest()
                indexer.delete(config.ES_INDEX_NAME, id)
                logger.warning("excel_row:{} removed.".format(x + config.DATA_START_ROW))

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
                logger.warning("excel_row:{} updated.".format(j))
        
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
    
    # only when all process succeeded
    file_store.save(config.ES_INDEX_NAME, store_files)

  except Exception as e:
    logger.error(e)
      
if __name__ == "__main__":
  main()