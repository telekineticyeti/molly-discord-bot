import * as Discord from 'discord.js';
import {DiscordBotCommand} from '../bot';
import {FlightRising} from '../classes/fllght-rising.class';

const fr = new FlightRising();

const usage = `**fr** _subcommand_
**Available sub commands:**
***time*** - Show the server time.
***bonus*** = Show today's Exalt bonuses.
`;
// ***rando*** = Show a random Dragon.

const botCommand: DiscordBotCommand = {
  name: 'fr',
  description: `Flight Rising commands`,
  cooldown: 5,
  usage,
  aliases: ['flightrising'],
  args: true,
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
