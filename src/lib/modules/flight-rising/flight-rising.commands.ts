import * as Discord from 'discord.js';
import {FlightRising} from './fllght-rising.class';
import {DiscordBotCommand} from 'typings/discord.js';
import {BotUtils} from '../../classes/utlities.class';

const fr = new FlightRising();
const botUtils = new BotUtils(__dirname);

const subcommands = [
  {
    name: 'time',
    usage: 'Display Flight Rising server time',
    execute: async function (target: Discord.Message | Discord.Channel) {
      const message = `The Flight Rising server time is ${await fr.getServerTime()}`;
      botUtils.renderMessage(target, message);
    },
  },
  {
    name: 'bonus',
    usage: 'Display current Exalt bonuses',
    execute: async function (target: Discord.Message | Discord.Channel) {
      const data = await fr.getFrontPage();

      const bonusFields = data.exaltBonuses.map(bonus => {
        return {
          name: `${bonus.name}:`,
          value: `***${bonus.type}*** - ${bonus.amount} `,
          inline: true,
        };
      });

      const attachment = await botUtils.attachmentFromUrl(
        fr.baseUrl + data.randomDragon.imageUrl,
        'randomDragon.png',
      );

      const embed = new Discord.MessageEmbed()
        .setColor('#731d08')
        .setTitle(`Todays Exalt Bonuses`)
        .setURL(data.randomDragon.url)
        .setDescription(
          `Server time is ${data.time}. There are ${data.userCount} people online.
      This random dragon is ${data.randomDragon.clan}'s Level ${data.randomDragon.level} **${data.randomDragon.name}**`,
        )
        .attachFiles([attachment])
        .setThumbnail('attachment://randomDragon.png')
        .addFields(bonusFields);

      botUtils.renderMessage(target, embed);
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
  subcommands,
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
