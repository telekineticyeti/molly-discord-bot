FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install && npm run build
COPY . .
CMD [ "node", "src/bot.js" ]