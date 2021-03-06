FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN apt-get update \
  && apt-get install -y ffmpeg \
  && yarn install \
  && yarn run build
CMD [ "yarn", "run", "deploy:start" ]
