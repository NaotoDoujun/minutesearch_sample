FROM python:3.8-bullseye
WORKDIR /app

RUN apt-get update -q && \
  apt-get upgrade  -qy && \
  apt-get install  -qy busybox-static && \
  apt-get clean all

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --no-cache-dir

# crawl schedule every hour
RUN mkdir -p /var/spool/cron/crontabs/ \
  && echo '15 */1 * * * busybox pidof python3 /app/main.py >/dev/null || python3 /app/main.py' > /var/spool/cron/crontabs/root

# copy
COPY . .

ENTRYPOINT ["busybox", "crond", "-f", "-L", "/dev/stderr"]