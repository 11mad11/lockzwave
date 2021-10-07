FROM node:16 as build

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm i

COPY ./src ./src
RUN npm run build:server


FROM node:16-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

CMD [ "node", "./dist/server/index.js" ]
