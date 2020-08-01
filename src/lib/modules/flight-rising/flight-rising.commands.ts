import * as Discord from 'discord.js';
import { FlightRising } from './fllght-rising.class';
import { DiscordBotCommand } from 'typings/discord.js';
import { BotUtils, DiscordTarget } from '../../classes/utlities.class';

const fr = new FlightRising();
const botUtils = new BotUtils(__dirname);

const subcommands = [
  {
    name: 'time',
    usage: 'Display Flight Rising server time',
    execute: async function (target: DiscordTarget) {
      const message = `The Flight Rising server time is ${await fr.getServerTime()}`;
      botUtils.renderMessage(target, message);
    },
  },
  {
    name: 'bonus',
    usage: 'Display current Exalt bonuses',
    execute: async function (target: DiscordTarget) {
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
  {
    name: 'dom',
    usage: 'Display dominance leaderboard',
    execute: async function (target: DiscordTarget) {
      const data = await fr.getDominancePage();

      let domList = '```';
      data.domPositions.map((flight, idx) => {
        const position = idx + 1;
        let whitespace = ' ';

        if (position <= 9) whitespace = '  ';

        domList += `${idx + 1}${whitespace}- ${flight[0]}\n`;
      });
      domList += '```';

      const attachment = await botUtils.attachmentFromUrl(
        `https://flightrising.com/${data.dominatingFlag}`,
        'domFlag.png',
      );

      const embed = new Discord.MessageEmbed()
        .setColor('#731d08')
        .setTitle(`Dominance`)
        .setURL('https://flightrising.com/main.php?p=dominance')
        .setDescription(`${data.currentlyDominating} flight is currently dominating.`)
        .attachFiles([attachment])
        .setThumbnail('attachment://domFlag.png')
        .addFields({
          name: `Next week's standings`,
          value: domList,
        })
        .setFooter(`Next tally will occur ${data.timeUntilNextTally}. 🐉`);

      botUtils.renderMessage(target, embed);
    },
  },
  {
    name: 'news',
    usage: 'Display latest news post',
    execute: async function (target: DiscordTarget) {
      const news = (await fr.getFrontPage()).news[0];
      const imageName = `news_${news.title}.png`;
      const attachment = await botUtils.attachmentFromUrl(news.imageUrl, imageName);
      const embed = new Discord.MessageEmbed()
        .setColor(fr.embedColour)
        .setTitle(news.title)
        .setDescription(news.body)
        .setURL(news.link || fr.baseUrl)
        .attachFiles([attachment])
        .setThumbnail(`attachment://${imageName}`)

      botUtils.renderMessage(target, embed);
    }
  },
  {
    name: 'updates',
    usage: 'Display latest update',
    execute: async function (target: DiscordTarget) {
      const update = (await fr.getFrontPage()).updates[0];
      const attachment = await botUtils.attachmentFromUrl(update.avatarUrl, 'update.png');
      const embed = new Discord.MessageEmbed()
        .setColor(fr.embedColour)
        .setTitle(update.body)
        .setURL(update.link)
        .attachFiles([attachment])
        .setFooter(`Update posted by ${update.author} on ${update.date}`, `attachment://update.png`)

      botUtils.renderMessage(target, embed);
    }
  }
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
