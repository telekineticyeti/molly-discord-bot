import * as Discord from 'discord.js';
import {DiscordTarget} from '../../classes/utlities.class';
import {DiscordBotCommand} from 'typings/discord.js';
import {Scraper} from './scraper.class';

const scraper = new Scraper();
const botUtils = require('../../classes/utlities.class');

const subcommands = [
  {
    name: 'add',
    usage: 'Add a website to scrape for changes.',
    execute: async function (target: DiscordTarget, args: string[]) {
      if (!args) return;
      try {
        await scraper.add(args[0]);
        botUtils.renderMessage(
          target,
          `${args[0]} has been added to the scrape scheduler. You will be notified next time that changes are detected.`,
        );
      } catch (error) {
        botUtils.renderMessage(target, 'Failed to add that site. Please check the URL!');
        console.error(error);
      }
    },
  },
  {
    name: 'remove',
    usage: 'Remove a website from scraper list.',
    execute: async function (target: DiscordTarget, args: string[]) {
      if (!args) return;
      try {
        await scraper.remove(args[0]);
        botUtils.renderMessage(target, `${args[0]} has been removed from the scrape scheduler.`);
      } catch (error) {
        botUtils.renderMessage(target, 'Failed to remove that site!');
        console.error(error);
      }
    },
  },
  {
    name: 'check',
    usage: 'Check all stored sites for changes',
    execute: async function (target: DiscordTarget) {
      const changes = await scraper.check();
      if (changes.length) {
        const fields = changes.map(item => ({
          name: item.url,
          value: `Change type: ${item.changeType}`,
        }));

        const embed = new Discord.MessageEmbed()
          .setColor('#bada55')
          .setTitle('Scrape Alert!')
          .setDescription('The following sites have changed since they were last checked.')
          .addFields(fields);

        botUtils.renderMessage(target, embed);
      }
    },
  },
];

const botCommand: DiscordBotCommand = {
  name: 'scrape',
  description: `Detect changes on URLs and announce when changes are found.`,
  usage: botUtils.generateCommandUsageString(subcommands),
  aliases: ['scraper'],
  args: true,
  categories: ['Utility'],
  subcommands,
  execute: botUtils.commandModuleExecutor(subcommands),
};

export = botCommand;

/**
 *
 * !scrape add  URL
 * remove
 * list
 *
 *
 */
