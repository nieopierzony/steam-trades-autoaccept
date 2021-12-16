FROM node:16

WORKDIR /usr/src/bot

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "node", "." ]