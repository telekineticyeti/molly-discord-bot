import * as Discord from 'discord.js';
import {Fo76} from './fo76.class';
import {DiscordBotCommand} from 'typings/discord.js';
import {BotUtils, DiscordTarget} from '../../classes/utlities.class';
import {Message} from 'discord.js';
import {ScheduleClass} from '../scheduler/schedule.class';

const scheduleClass: ScheduleClass = require('../scheduler/schedule.class');
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
    execute: async function (target: Message, _args: string[]) {
      /**
       * TODO
       * Modularise these methods
       *
       * - Get Options
       * - Create Options Set
       * - Prompt for Options
       * - Process Chosen Option
       */
      const userId = target.author.id;

      const options = ['Cranberry Bog', 'The Forest', 'The Savage Divide'];

      let triggers: string[] = [];
      let str = '```';

      const makeOpts = () => {
        let triggerCount = 1;

        options.forEach(opt => {
          triggers.push(`${triggerCount}`);
          str += `${triggerCount} - ${opt}\n`;
          triggerCount++;
        });

        // return [{1: aaaaaa, 2: bbbbbbb, 3: ccccccc}];
      };

      makeOpts();
      str += '```';

      const handler = (opt: string) => {
        const choice = options[parseInt(opt) - 1];
        target.channel.send(`You selected ${opt} (${choice})`);
        scheduleClass.dispatcher.removeListener(userId, handler);
        scheduleClass.unregisterListener({triggers, userId});

        setTimeout(() => {
          console.log(scheduleClass.listeners);
        }, 2000);
      };

      scheduleClass.registerListener({triggers, userId});
      scheduleClass.dispatcher.on(userId, handler);

      const embed = new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setTitle(`Treasure Maps`)
        .addField('Select One of the following', str);

      botUtils.renderMessage(target, embed);
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
