FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN apt-get update \
  && apt-get install -y ffmpeg \
  && npm install \
  && npm run build
CMD [ "npm", "run", "deploy:start" ]
