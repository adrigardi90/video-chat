FROM node:8.6 as build

WORKDIR /videochat
COPY package.json /videochat/
RUN npm install

COPY ./ /videochat

ARG VUE_APP_SOCKET_HOST=NOT_SET
ARG VUE_APP_SOCKET_PORT=NOT_SET

RUN export VUE_APP_SOCKET_HOST=${VUE_APP_SOCKET_HOST} VUE_APP_SOCKET_PORT=${VUE_APP_SOCKET_PORT} && npm run build

CMD ["npm", "run", "run:server"]