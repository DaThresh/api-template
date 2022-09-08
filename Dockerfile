FROM --platform=linux/amd64 node:18.8-slim

WORKDIR /app

COPY package.json yarn.lock tsconfig.json /app/

RUN yarn install

COPY src src

RUN yarn build
RUN rm -rf ./src

RUN rm -rf node_modules
RUN yarn install --production --ignore-scripts --prefer-offline
RUN yarn cache clean

ENV PORT 8080
EXPOSE $PORT

CMD node dist/server.js