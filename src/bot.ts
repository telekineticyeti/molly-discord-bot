import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';

import {DeepRockBotCommands} from './classes/deeprock-botcommands';

const drg = new DeepRockBotCommands();

dotenv.config();

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

bot.login(TOKEN);

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
  if (msg.content.match(/!deepdive[s]?/is)) {
    const deepDiveInfo = await drg.getDeepDives();
    msg.channel.send(deepDiveInfo);
  }
});
