import * as Discord from 'discord.js';
import {DeepRockBotCommands} from '../classes/deeprock-botcommands';
const drg = new DeepRockBotCommands();

const command: any = {
  name: 'deepdive',
  description: `Show this week's deep dive information`,
  execute: async (message: Discord.Message): Promise<void> => {
    const deepDiveInfo = await drg.getDeepDives();
    message.channel.send(deepDiveInfo);
  },
};

export = command;
