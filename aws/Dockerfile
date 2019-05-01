FROM node:8.6 as build

WORKDIR /videochat
COPY package.json /videochat/
COPY /aws/default.conf /etc/nginx/conf.d
RUN npm install

COPY /server /videochat/server

CMD ["npm", "run", "run:server"]
