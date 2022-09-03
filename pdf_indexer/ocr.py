import os, base64
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.layout import LAParams
from pdfminer.converter import TextConverter
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
import pyocr
from PIL import ImageEnhance
import pdf2image
from io import BytesIO, StringIO
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

  def pdf2images(self, file):
    return pdf2image.convert_from_path(file, dpi=200, fmt='jpg')

  def get_page_count(self, file):
    with open(file, 'rb') as fp:
      pages = PDFPage.get_pages(fp)
      cnt = 0
      for _ in pages:
        cnt += 1
    return cnt

  def ocr_pdfminer(self, file):
    """
    For Text embedding Pdf
    """
    self.logger.info("processing ocr_pdfminer()")
    filename = os.path.split(file)[1]
    self.logger.info("processing file is {}".format(filename))
    images = self.pdf2images(file)
    results, page_cnt = [], 1
    with open(file, 'rb') as fp:
      output = StringIO()
      resource_manager = PDFResourceManager()
      laparams = LAParams()
      text_converter = TextConverter(resource_manager, output, laparams=laparams)
      page_interpreter = PDFPageInterpreter(resource_manager, text_converter)
      for page in PDFPage.get_pages(fp):
        self.logger.info("processing page is {}".format(page_cnt))
        page_interpreter.process_page(page)
        img_base64 = self.to_base64(images[page_cnt - 1])
        text = output.getvalue()
        text = text.replace(' ', '')
        results.append({'page': page_cnt, 'text': text, 'image': img_base64, 'filename': filename, 'path': file})
        page_cnt += 1
        output.truncate(0)
        output.seek(0)

      output.close()
      text_converter.close()
    return results

  def ocr_tesseract(self, file):
    """
    For Image Pdf
    """
    self.logger.info("processing ocr_tesseract()")
    filename = os.path.split(file)[1]
    self.logger.info("processing file is {}".format(filename))
    images = self.pdf2images(file)
    results, page_cnt = [], 1
    for image in images:
      self.logger.info("processing page is {}".format(page_cnt))
      img_base64 = self.to_base64(image)
      img_g = image.convert('L')
      enhancer= ImageEnhance.Contrast(img_g)
      img_con = enhancer.enhance(2.0)
      text = self.tool.image_to_string(img_con , lang='jpn', builder=self.builder)
      text = text.replace(' ', '')
      results.append({'page': page_cnt, 'text': text, 'image': img_base64, 'filename': filename, 'path': file})
      page_cnt += 1
    return results

  def get_texts(self, file):
    results = self.ocr_pdfminer(file)
    is_image_pdf = False
    for result in results:
      if len(result['text']) <= 1:
        is_image_pdf = True
        break
    if is_image_pdf:
      results = self.ocr_tesseract(file)
    return results
