import {FlightRising} from './fllght-rising.class';
import {BotUtils} from '../../classes/utlities.class';
import * as Discord from 'discord.js';

const fr = new FlightRising();
const botUtils = new BotUtils(__dirname);

export class FlightRisingHelpers {
  public async buildExaltBonusEmbed() {
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

    return embed;
  }
}
