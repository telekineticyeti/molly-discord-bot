import * as Discord from 'discord.js';
import {Fo76} from './fo76.class';
import {DiscordBotCommand} from 'typings/discord.js';
import {BotUtils, DiscordTarget} from '../../classes/utlities.class';

const fo76 = new Fo76();
const botUtils = new BotUtils(__dirname);

const subcommands = [
  {
    name: 'news',
    usage: 'Show latest Fallout 76 related news',
    execute: async function (target: DiscordTarget) {
      const news = await fo76.getNews();
      const embed = new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setTitle(news[0].title)
        .setDescription(news[0].blurb)
        .setURL(news[0].newsUrl)
        .addField('Date', news[0].date)
        .setThumbnail(news[0].imageUrl);

      botUtils.renderMessage(target, embed);
    },
  },
  {
    name: 'codes',
    usage: 'Display nuclear codes for this week.',
    execute: async function (target: DiscordTarget) {
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
      botUtils.renderMessage(target, embed);
    },
  },
  {
    name: 'map',
    usage: 'Display treasure maps',
    execute: async function (_target: DiscordTarget, args: string[]) {
      console.log(args);
    },
  },
];

/**
 * Sets up the primary bot command
 */
const botCommand: DiscordBotCommand = {
  name: 'fallout76',
  description: `Fallout 76 Commands`,
  usage: botUtils.generateCommandUsageString(subcommands),
  aliases: ['76', 'fo76', 'fo'],
  args: true,
  categories: ['Info'],
  subcommands,
  execute: botUtils.commandModuleExecutor(subcommands),
};

export = botCommand;
