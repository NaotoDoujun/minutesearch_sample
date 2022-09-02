FROM node:16.13.0-slim AS build

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
RUN npm install

COPY . /usr/src/app
RUN npm run build

FROM nginx:1.21.3 AS base
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]