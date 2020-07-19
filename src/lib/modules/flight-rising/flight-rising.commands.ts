import * as Discord from 'discord.js';
import {FlightRising} from './fllght-rising.class';
import {DiscordBotCommand} from 'typings/discord.js';
import {BotUtils} from '../../classes/utlities.class';
import {FlightRisingHelpers} from './flight-rising.helpers';

const fr = new FlightRising();
const botUtils = new BotUtils(__dirname);
const frHelpers = new FlightRisingHelpers();

const subcommands = [
  {
    name: 'time',
    usage: 'Display Flight Rising server time',
    execute: async function (message: Discord.Message) {
      const time = await fr.getServerTime();
      message.channel.send(`The Flight Rising server time is ${time}`);
    },
  },
  {
    name: 'bonus',
    usage: 'Display current Exalt bonuses',
    execute: async function (message: Discord.Message) {
      const embed = await frHelpers.buildExaltBonusEmbed();
      message.channel.send(embed);
    },
  },
];

const botCommand: DiscordBotCommand = {
  name: 'flightrising',
  description: `Flight Rising commands`,
  usage: botUtils.generateCommandUsageString(subcommands),
  aliases: ['fr'],
  args: true,
  categories: ['Info'],
  execute: async (message: Discord.Message, args: string[]): Promise<void> => {
    if (!args.length) {
      message.reply(
        'That command requires a subcommand. Use `!help` on this command for available subcommands.',
      );
      return;
    }

    const invokeSubCommand = subcommands.filter(subcommand => {
      return subcommand.name === args[0];
    });

    if (invokeSubCommand.length) {
      invokeSubCommand[0].execute(message);
    } else {
      message.channel.send(`Sub command \`${args[0]}\` was not found, or is not yet implemented`);
    }
  },
};

export = botCommand;
