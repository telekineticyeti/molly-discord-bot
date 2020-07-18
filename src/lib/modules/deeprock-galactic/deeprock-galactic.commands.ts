import * as Discord from 'discord.js';
import {DeepRockBotCommands} from './deeprock-galactic.class';
import {DiscordBotCommand} from 'typings/discord.js';
const drg = new DeepRockBotCommands();

const botCommand: DiscordBotCommand = {
  name: 'deepdive',
  description: `Show this week's deep dive information`,
  cooldown: 5,
  aliases: ['deepdives'],
  execute: async (message: Discord.Message): Promise<void> => {
    const deepDiveInfo = await drg.getDeepDives();
    message.channel.send(deepDiveInfo);
  },
};

export = botCommand;
