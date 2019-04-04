FROM node:10.15.3-alpine as BASE
WORKDIR /app
COPY package*.json ./
RUN npm install --silent --progress=false
COPY . .
RUN npm test
