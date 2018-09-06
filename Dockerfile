FROM node:latest

ENV HOME=/home/blue-stream

COPY package*.json $HOME/app/

RUN chown -R node $HOME/* /usr/local/

WORKDIR $HOME/app

RUN npm install --silent --progress=false

COPY . $HOME/app/

RUN chown -R node $HOME/*

EXPOSE 3000

USER node

CMD ["npm", "start"]