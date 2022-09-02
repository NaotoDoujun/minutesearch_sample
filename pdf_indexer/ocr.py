import os, base64
import pyocr
from PIL import ImageEnhance
import pdf2image
from io import BytesIO
from logging import getLogger, NullHandler, INFO

class Ocr:

  TESSERACT_PATH = '/usr/bin/tesseract'
  TESSDATA_PATH = '/usr/share/tesseract-ocr/4.00/tessdata'

  def __init__(self, name=__name__):
    os.environ["PATH"] += os.pathsep + self.TESSERACT_PATH
    os.environ["TESSDATA_PREFIX"] = self.TESSDATA_PATH
    self.logger = getLogger(name)
    self.logger.addHandler(NullHandler())
    self.logger.setLevel(INFO)
    self.logger.propagate = True
    tools = pyocr.get_available_tools()
    self.tool = tools[0]
    self.builder = pyocr.builders.TextBuilder(tesseract_layout=6)

  def to_base64(self, image, format="jpeg"):
    buffer = BytesIO()
    image.save(buffer, format)
    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return img_str

  def get_texts(self, file):
    filename = os.path.split(file)[1]
    self.logger.info("filename: {}".format(filename))
    images = pdf2image.convert_from_path(file, dpi=200, fmt='jpg')
    self.logger.info("total pages: {}".format(len(images)))
    results, page = [], 1
    for image in images:
      self.logger.info("processing page is {}".format(page))
      img_base64 = self.to_base64(image)
      img_g = image.convert('L')
      enhancer= ImageEnhance.Contrast(img_g)
      img_con = enhancer.enhance(2.0)
      txt_pyocr = self.tool.image_to_string(img_con , lang='jpn', builder=self.builder)
      txt_pyocr = txt_pyocr.replace(' ', '')
      self.logger.info("result: {}".format(txt_pyocr))
      results.append({'page': page, 'text': txt_pyocr, 'image': img_base64, 'filename': filename, 'path': file})
      page += 1
    return results

