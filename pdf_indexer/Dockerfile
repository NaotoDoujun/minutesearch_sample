FROM python:3.10-bullseye
WORKDIR /app

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y busybox-static poppler-utils tesseract-ocr libtesseract-dev wget && \
  apt-get clean all

RUN wget -P /usr/share/tesseract-ocr/4.00/tessdata https://github.com/tesseract-ocr/tessdata_best/raw/main/jpn.traineddata && \
  wget -P /usr/share/tesseract-ocr/4.00/tessdata https://github.com/tesseract-ocr/tessdata_best/raw/main/jpn_vert.traineddata

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --no-cache-dir

# crawl schedule every hour
RUN mkdir -p /var/spool/cron/crontabs/ \
  && echo '0 */1 * * * busybox pidof python3 /app/main.py >/dev/null || python3 /app/main.py' > /var/spool/cron/crontabs/root

# copy
COPY . .

ENTRYPOINT ["busybox", "crond", "-f", "-L", "/dev/stderr"]