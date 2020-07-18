import * as Discord from 'discord.js';
import {DiscordBotCommand} from 'typings/discord.js';
import {randomItemFromArray} from '../../classes/utlities.class';

const botCommand: DiscordBotCommand = {
  name: 'pick4me',
  description: `Give me a list of comma seperated choices, and I will pick one for you.`,
  aliases: ['pick'],
  args: true,
  execute: async (message: Discord.Message, args: string[]): Promise<void> => {
    if (!args.length) {
      message.reply('It might be nice if you gave me some options to pick from :)');
      return;
    }

    const options = args.join(' ').split(', ');
    const choice = randomItemFromArray(options);

    message.reply(`I have picked '${choice}' for you. Are you happy?`);
  },
};

export = botCommand;
