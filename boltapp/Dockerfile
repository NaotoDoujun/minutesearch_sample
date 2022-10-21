FROM node:16.13.0-slim

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json .
RUN npm install

COPY .env .
COPY index.js .

CMD [ "node", "index.js" ]