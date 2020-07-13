import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as Discord from 'discord.js';
import {attachmentFromUrl} from './utlities.class';

export class FlightRising {
  // https://flightrising.com/main.php?p=dominance
  // would be good to pull server time and at least the first three places of the righthand list; invokable command, preferable !fr dom

  // https://www1.flightrising.com/
  // bottom right box, Exalt Bonuses, would be nice to have that + server time announce once a day between 9 and 10 am our time

  public readonly baseUrl = 'https://www1.flightrising.com';

  public async getPage(url: string): Promise<string> {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  }

  public async getServerTime(): Promise<string> {
    const $ = cheerio.load(await this.getPage(this.baseUrl));
    return this.parseTime($('.time.common-tooltip').text());
  }

  public async getExaltBonuses(): Promise<IExaltBonus[]> {
    const $ = cheerio.load(await this.getPage(this.baseUrl));
    return this.parseExaltBonuses($('#bonus-ticker .bonus-text'));
  }

  public async getRandomDragon(): Promise<IRandomDragon> {
    const $ = cheerio.load(await this.getPage(this.baseUrl));
    return this.parseRandomDragon($('#random-dragon'));
  }

  private parseTime(time: string): string {
    return time.replace('|', '').trim();
  }

  private parseUserCount(count: string): string {
    return count.replace('Users Online', '').trim();
  }

  private parseExaltBonuses(rawBonuses: Cheerio): IExaltBonus[] {
    const $ = cheerio;
    const bonuses: IExaltBonus[] = [];

    rawBonuses.each((_i, ele) => {
      const bonus = $(ele).text().split('+');
      const type = bonus[0].trim().split(' ')[0];
      const name = bonus[0].trim().split(' ')[1];
      const amount = parseInt(bonus[1]);

      bonuses.push({name, type, amount});
    });

    bonuses.sort((a, b) => {
      if (a.amount > b.amount) return -1;
      if (a.amount < b.amount) return 1;
      return 0;
    });

    return bonuses;
  }

  private parseRandomDragon(rawDragon: Cheerio): IRandomDragon {
    const $ = cheerio;

    const dragon: IRandomDragon = {
      url: '',
      imageUrl: '',
      clan: '',
      name: '',
      level: '',
    };

    rawDragon.children('a').each((i, ele) => {
      switch (i) {
        case 0:
          dragon.url = $(ele).attr('href') || '';
          dragon.imageUrl = $(ele).children('img').attr('src') || '';
          break;
        case 1:
          dragon.clan = $(ele).text().split(`'`)[0];
          break;
        case 2:
          const info = $(ele).text().split('-');
          dragon.name = info[0].trim();
          break;
        default:
          throw 'Error parsing the random dragon scrape';
      }
    });

    try {
      dragon.level = rawDragon.text().split(' - ')[1].replace('Lvl', '').trim();
    } catch (e) {
      console.log(`Could not determine rando dragon's level. ${e}`);
    }

    return dragon;
  }

  public async composeBonusMessage(): Promise<Discord.MessageEmbed> {
    const $ = cheerio.load(await this.getPage(this.baseUrl));

    const randomDragon = this.parseRandomDragon($('#random-dragon'));
    const exaltBonuses = this.parseExaltBonuses($('#bonus-ticker .bonus-text'));
    const time = this.parseTime($('.time.common-tooltip').text());
    const userCount = this.parseUserCount($('.users-online .online').text());

    const description = `
      Server time is ${time}. There are ${userCount} people online.
      This random dragon is ${randomDragon.clan}'s Level ${randomDragon.level} **${randomDragon.name}**
    `;

    const attachment = await attachmentFromUrl(
      this.baseUrl + randomDragon.imageUrl,
      'randomDragon.png',
    );

    const renderBonuses = exaltBonuses.map(bonus => {
      return {
        name: `${bonus.name}:`,
        value: `***${bonus.type}*** - ${bonus.amount} `,
        inline: true,
      };
    });

    return new Discord.MessageEmbed()
      .setColor('#731d08')
      .setTitle(`Todays Exalt Bonuses`)
      .setURL(randomDragon.url)
      .setDescription(description)
      .attachFiles([attachment])
      .setThumbnail('attachment://randomDragon.png')
      .addFields(renderBonuses);
  }
}

interface IExaltBonus {
  name: string;
  type: string;
  amount: number;
}

export interface IRandomDragon {
  url: string;
  imageUrl: string;
  clan: string;
  name: string;
  level: string;
}
