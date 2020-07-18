import * as Discord from 'discord.js';
import {Fo76} from './fo76.class';
import {DiscordBotCommand} from 'typings/discord.js';
const fo76 = new Fo76();

const usage =
  `\`subcommand\`\n` +
  `\n` +
  `**Available sub-commands:**\n` +
  `\`codes\` - Display the nuclear codes for this week.\n`;

const botCommand: DiscordBotCommand = {
  name: 'fallout76',
  description: `Fallout 76 Commands`,
  cooldown: 5,
  usage,
  aliases: ['76', 'fo76'],
  args: true,
  categories: ['Info'],
  execute: async (message: Discord.Message, args: string[]): Promise<void> => {
    if (!args.length) {
      message.reply('That command requires a subcommand. See help for details.');
      return;
    }

    const codes = async () => {
      const bonus = await fo76.composeNuclearCodeMessage();
      message.channel.send(bonus);
    };

    const error = (error: string) => {
      message.channel.send(error);
    };

    switch (args[0]) {
      case 'codes':
        codes();
        break;
      default:
        error('Command not found or not yet implemented.');
        break;
    }
  },
};

export = botCommand;
