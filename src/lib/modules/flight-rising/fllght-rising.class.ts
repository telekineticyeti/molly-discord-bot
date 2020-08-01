import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

export class FlightRising {
  public readonly baseUrl = 'https://www1.flightrising.com';
  public readonly fallbackImage = 'https://flightrising.com/images/layout/logo.png';
  public readonly embedColour = '#731d08';

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

  public async getFrontPage() {
    const $ = cheerio.load(await this.getPage(this.baseUrl));

    const randomDragon = this.parseRandomDragon($('#random-dragon'));
    const time = this.parseTime($('.time.common-tooltip').text());
    const userCount = this.parseUserCount($('.users-online .online').text());
    const exaltBonuses = this.parseExaltBonuses($('#bonus-ticker .bonus-text'));
    const news = this.parseNews($('#home-content .announcement'));
    const updates = this.parseUpdates($('#status-box #status-box-mid .status-row'));

    return { randomDragon, time, userCount, exaltBonuses, news, updates };
  }

  public async getDominancePage() {
    const $ = cheerio.load(await this.getPage(`${this.baseUrl}/main.php?p=dominance`));
    const domPositions = this.parseDomList(
      $('#super-container > div:nth-child(6) > span:nth-child(1) img'),
    );
    const currentlyDominating = $('#domtext .domglow').text();
    const dominatingFlag = $('#domflag img')[0].attribs.src;
    const timeUntilNextTally = this.parseTimeUntilNextTally($('.kkcount-down10')[0].attribs.time);

    return { currentlyDominating, domPositions, timeUntilNextTally, dominatingFlag };
  }

  private parseDomList(domPositions: Cheerio) {
    let flights: [string, string][] = [];

    domPositions.each((_idx, item) => {
      const flight_image = item.attribs.src;
      let flightName = flight_image
        .replace(/^.*[\\\/]/, '')
        .replace(/\.png$/, '')
        .replace(/^(first|second)+place_/, '');

      flightName = flightName.charAt(0).toUpperCase() + flightName.slice(1);

      flights.push([flightName, `https://flightrising.com${flight_image}`]);
    });

    return flights;
  }

  private parseNews(announcements: Cheerio): IFrNews[] {
    const $ = cheerio;
    const news: IFrNews[] = [];

    announcements.each((_idx, ele) => {
      const image = $(ele).children('.announce-text').find('.bbcode_center:nth-child(1) > a > img').attr('src');
      const item = {
        title: $(ele).find('.screen-reader').text().trim(),
        body: $(ele).children().not('.screen-reader, .bbcode_center, .announce-footer').text().trim(),
        link: $(ele).find('.screen-reader > a').attr('href'),
        imageUrl: image ? image : this.fallbackImage
      }
      news.push(item)
    })

    return news;
  }

  private parseUpdates(rawUpdates: Cheerio): IFrUpdate[] {
    const $ = cheerio;
    const updates: IFrUpdate[] = [];

    rawUpdates.each((_idx, ele) => {
      const avatar = $(ele).find('img.mini-avatar').attr('src');
      const link = $(ele).find('.status-row-text a:nth-child(1)').attr('href');
      const item = {
        author: $(ele).find('.status-author a').text().trim(),
        avatarUrl: avatar ? `${this.baseUrl}${avatar}` : this.fallbackImage,
        body: $(ele).find('.status-row-text').text().trim(),
        date: $(ele).find('.status-author span').text().trim(),
        link: link ? link : 'https://www1.flightrising.com/site/dev-tracker',
      }

      updates.push(item);
    });

    return updates;
  }

  private parseTimeUntilNextTally(time: string) {
    return moment.unix(parseInt(time)).fromNow();
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

      bonuses.push({ name, type, amount });
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

interface IFrNews {
  title: string;
  body: string;
  link?: string;
  imageUrl: string;
}

interface IFrUpdate {
  author: string;
  avatarUrl: string;
  body: string;
  date: string;
  link: string;
}
