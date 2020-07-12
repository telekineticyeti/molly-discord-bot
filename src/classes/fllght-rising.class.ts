import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as Discord from 'discord.js';

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

  public async getExaltBonuses(): Promise<IExaltBonuses> {
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

  private parseExaltBonuses(rawBonuses: Cheerio): IExaltBonuses {
    const $ = cheerio;

    const bonuses = {
      primary: '',
      primaryAmount: 0,
      breed: '',
      breedAmount: 0,
      gene: '',
      geneAmount: 0,
    };

    const bonusFilter = (bonusExpl: string[]) => {
      const bonusType = bonusExpl[0].trim().split(' ')[1];

      switch (bonusType as BonusTypes) {
        case 'Primary':
          bonuses.primary = bonusExpl[0].trim().split(' ')[0];
          bonuses.primaryAmount = parseInt(bonusExpl[1]);
          break;
        case 'Breed':
          bonuses.breed = bonusExpl[0].trim().split(' ')[0];
          bonuses.breedAmount = parseInt(bonusExpl[1]);
          break;
        case 'Gene':
          bonuses.gene = bonusExpl[0].trim().split(' ')[0];
          bonuses.geneAmount = parseInt(bonusExpl[1]);
          break;
        default:
          throw `Filter failure: ${bonusExpl}`;
      }
    };

    rawBonuses.each((_i, ele) => {
      const bonus = $(ele).text().split('+');
      bonusFilter(bonus);
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

    const imageResponse = await fetch(this.baseUrl + randomDragon.imageUrl);
    const imageStream = await imageResponse.buffer();
    const imageAttachment = new Discord.MessageAttachment(imageStream, 'randomDragon.png');

    return new Discord.MessageEmbed()
      .setColor('#731d08')
      .setTitle(`Todays Exalt Bonuses`)
      .setURL(randomDragon.url)
      .setDescription(description)
      .attachFiles([imageAttachment])
      .setThumbnail('attachment://randomDragon.png')
      .addFields(
        {
          name: `Primary Bonus:`,
          value: `***${exaltBonuses.primary}*** - ${exaltBonuses.primaryAmount} `,
          inline: true,
        },
        {
          name: `Breed Bonus:`,
          value: `***${exaltBonuses.breed}*** - ${exaltBonuses.breedAmount} `,
          inline: true,
        },
        {
          name: `Gene Bonus:`,
          value: `***${exaltBonuses.gene}*** - ${exaltBonuses.geneAmount} `,
          inline: true,
        },
      );
  }
}

export type BonusTypes = 'Breed' | 'Primary' | 'Gene';

export interface IExaltBonuses {
  primary: string;
  primaryAmount: number;
  breed: string;
  breedAmount: number;
  gene: string;
  geneAmount: number;
}

export interface IRandomDragon {
  url: string;
  imageUrl: string;
  clan: string;
  name: string;
  level: string;
}
