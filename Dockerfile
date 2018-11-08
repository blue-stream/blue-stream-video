FROM node:latest

ENV HOME=/home/blue-stream

COPY package*.json $HOME/app/

RUN chown -R node $HOME/* /usr/local/

WORKDIR $HOME/app

RUN npm install --silent --progress=false

COPY . $HOME/app/

RUN chown -R node $HOME/*

USER node

EXPOSE 3000

CMD ["npm", "start"]