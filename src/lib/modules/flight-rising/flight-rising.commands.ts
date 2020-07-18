import * as Discord from 'discord.js';
import {FlightRising} from './fllght-rising.class';
import {DiscordBotCommand} from 'typings/discord.js';

const fr = new FlightRising();

const usage =
  `\`subcommand\`\n` +
  `\n` +
  `**Available sub-commands:**\n` +
  `\`time\` - Display Flight Rising server time.\n` +
  `\`bonus\` - Display current exalt bonuses.\n`;

const botCommand: DiscordBotCommand = {
  name: 'flightrising',
  description: `Flight Rising commands`,
  cooldown: 5,
  usage,
  aliases: ['fr'],
  args: true,
  categories: ['Info'],
  execute: (message: Discord.Message, args: string[]) => {
    if (!args.length) {
      message.reply('That command requires a subcommand. See help for details.');
      return;
    }

    const showTime = async () => {
      const time = await fr.getServerTime();
      message.channel.send(`The Flight Rising server time is ${time}`);
    };

    // !fr bonus
    const showBonus = async () => {
      const bonus = await fr.composeBonusMessage();
      message.channel.send(bonus);
    };

    const showRandomDragon = async () => {
      const dragon = await fr.getRandomDragon();
      console.log(dragon);
    };

    const error = (error: string) => {
      message.channel.send(error);
    };

    switch (args[0]) {
      case 'time':
        showTime();
        break;
      case 'bonus':
        showBonus();
        break;
      case 'rando':
        showRandomDragon();
        break;
      default:
        error('Command not found or not yet implemented.');
        break;
    }
  },
};

export = botCommand;
