FROM python:3.8
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt --no-cache-dir

# copy
COPY . .

ENTRYPOINT [ "python3", "main.py" ]