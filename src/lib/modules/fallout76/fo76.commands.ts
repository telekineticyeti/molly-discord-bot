import * as Discord from 'discord.js';
import {Fo76} from './fo76.class';
import {DiscordBotCommand} from 'typings/discord.js';
import {BotUtils} from '../../classes/utlities.class';

const fo76 = new Fo76();
const botUtils = new BotUtils(__dirname);

const subcommands = [
  {
    name: 'news',
    usage: 'Show latest Fallout 76 related news',
    execute: async function (message: Discord.Message) {
      const news = await fo76.getNews();
      const embed = new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setTitle(news[0].title)
        .setDescription(news[0].blurb)
        .setURL(news[0].newsUrl)
        .addField('Date', news[0].date)
        .setThumbnail(news[0].imageUrl);

      message.channel.send(embed);
    },
  },
  {
    name: 'codes',
    usage: 'Display nuclear codes for this week.',
    execute: async function (message: Discord.Message) {
      const codesData = await fo76.getNuclearCodes();

      const attachment = await botUtils.attachmentFromFile(
        './assets/images/bombrider.png',
        'nukes.png',
      );

      const renderCodes = Object.keys(codesData.codes).map(e => ({
        name: e.toLocaleUpperCase(),
        value: codesData.codes[e],
        inline: true,
      }));

      const embed = new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setTitle(`Nuclear Codes`)
        .setDescription(`Nuclear launch codes will reset ***${codesData.nextResetFriendly}***`)
        .setURL('https://nukacrypt.com/')
        .addFields(renderCodes)
        .attachFiles([attachment])
        .setThumbnail('attachment://nukes.png');
      message.channel.send(embed);
    },
  },
];

const botCommand: DiscordBotCommand = {
  name: 'fallout76',
  description: `Fallout 76 Commands`,
  usage: botUtils.generateCommandUsageString(subcommands),
  aliases: ['76', 'fo76', 'fo'],
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
