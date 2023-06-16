FROM node:18.3.0-slim

WORKDIR /app
ENV NODE_ENV production
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json .
RUN npm install

COPY .envsample .env /app/
COPY . .

CMD [ "node", "app.js" ]