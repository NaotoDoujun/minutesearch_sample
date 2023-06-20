FROM python:3.10-bullseye
WORKDIR /app

RUN apt-get update -q && \
  apt-get upgrade -qy && \
  apt-get install -qy cmake g++ make wget xz-utils curl && \
  apt-get clean all

# download juman++
RUN wget "https://github.com/ku-nlp/jumanpp/releases/download/v2.0.0-rc3/jumanpp-2.0.0-rc3.tar.xz" && \
  tar xvf jumanpp-2.0.0-rc3.tar.xz

# build and install juman++
RUN cd jumanpp-2.0.0-rc3 && \
  mkdir bld && cd bld && \
  curl -LO https://github.com/catchorg/Catch2/releases/download/v2.13.8/catch.hpp && \
  mv catch.hpp ../libs/ && \
  cmake .. -DCMAKE_BUILD_TYPE=Release && \
  make install -j "$(nproc)" && make install

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt --no-cache-dir

# copy
COPY . .

ENTRYPOINT [ "python3", "main.py" ]