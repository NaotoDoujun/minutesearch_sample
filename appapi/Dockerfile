FROM python:3.8
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --no-cache-dir

# copy main.py
COPY main.py .

ENTRYPOINT [ "python3", "main.py" ]