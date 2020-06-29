FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install && npm run build
CMD [ "node", "/usr/src/app/dist/bot.js" ]
