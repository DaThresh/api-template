FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json /app/
COPY src src

RUN pnpm install
RUN pnpm build

RUN rm -rf ./src
RUN pnpm prune --prod

ENV PORT 8080
EXPOSE $PORT

CMD node dist/server.js