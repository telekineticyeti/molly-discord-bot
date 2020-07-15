import * as Discord from 'discord.js';
import {DiscordBotCommand} from '../bot';
import {DeepRockBotCommands} from '../classes/deeprock-galactic.class';
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
