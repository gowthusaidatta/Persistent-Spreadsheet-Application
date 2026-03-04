FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY .env.example ./

ENV PORT=3000
ENV DATA_STORAGE_PATH=/app/data

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/server.js"]
