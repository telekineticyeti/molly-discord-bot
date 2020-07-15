import * as Discord from 'discord.js';
import {Fo76} from '../classes/fo76.class';
import {DiscordBotCommand} from 'typings/discord.js';
const fo76 = new Fo76();

const usage = `**76** _subcommand_
**Available sub commands:**
***codes*** - Show nuclear codes.
`;

const botCommand: DiscordBotCommand = {
  name: 'fo76',
  description: `Fallout 76 Commands`,
  cooldown: 5,
  usage,
  aliases: ['76'],
  args: true,
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
