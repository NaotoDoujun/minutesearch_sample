FROM python:3.8
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt --no-cache-dir

# download trained model
RUN python3 -m spacy download ja_core_news_lg

# copy main.py
COPY main.py .

ENTRYPOINT [ "python3", "main.py" ]