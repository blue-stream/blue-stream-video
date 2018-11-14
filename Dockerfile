ARG PORT

FROM node:latest

ENV HOME=/home/blue-stream
ENV PORT=$PORT

COPY package*.json $HOME/app/

RUN chown -R node $HOME/* /usr/local/

WORKDIR $HOME/app

RUN npm install --silent --progress=false

COPY . $HOME/app/

RUN chown -R node $HOME/*

USER node

EXPOSE $PORT

CMD ["npm", "start"]