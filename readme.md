# Molly Discord Bot

She's a good mule.

## Usage

This bot is developed in node and can be deployed with docker. To get started quickly, clone this repository and create a .env file in the root of the repo with your [bot token](https://discord.com/developers/applications/), example: `TOKEN=MySecretTokenString`

### Deploying with node

```
npm install
npm run build
node dist/bot.js
```

### Deploying with docker

```
docker build -t molly .
docker run -d --rm molly
```

### Deploying with docker-compose

```
docker-compose build
docker-compose up
```

### Commands

- `!deepdive / !deepdives` - Display a neatly formatted embedded summary of Deep Rock Galactic deep dives, parsed from the [weekly subreddit thread](https://www.reddit.com/r/DeepRockGalactic/). (Currently displays only normal mode deep dive).
