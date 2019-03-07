FROM node:8.6 as build

WORKDIR /videochat
COPY package.json /videochat/
RUN npm install

COPY ./ /videochat
RUN npm run build

CMD ["npm", "run", "run:server"]