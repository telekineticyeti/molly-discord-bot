import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';

import {DeepRockBotCommands} from './classes/deeprock-botcommands';

const drg = new DeepRockBotCommands();

dotenv.config();

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

bot.login(TOKEN);

// bot.commands.set()

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user!.tag}!`);
});

bot.on('message', async msg => {
  if (msg.content.match(/!deepdive[s]?/is)) {
    const deepDiveInfo = await drg.getDeepDives();
    msg.channel.send(deepDiveInfo);
  }
  if (msg.content.match(/!about/is)) {
    msg.channel.send('BEEP BOOP BRRRP\n');
  }

  if (msg.mentions.users.size) {
  }

  // if (msg.content.startsWith('!kick')) {
  // if (msg.mentions.users.size) {
  //   const taggedUser = msg.mentions.users.first();
  //   msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
  // } else {
  //   msg.reply('Please tag a valid user!');
  // }
});
