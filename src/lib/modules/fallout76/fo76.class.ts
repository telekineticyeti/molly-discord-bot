import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

export class Fo76 {
  private readonly bethesdaBaseUrl = 'https://fallout.bethesda.net';
  private readonly bethesdaNewsApiUrl =
    this.bethesdaBaseUrl + '/api/v1/components/news?games=&exclude=&offset=0-0&lang=en';
  private readonly urlNukeCodes = 'https://nukacrypt.com/';

  public async getNuclearCodes(): Promise<INuclearCodes> {
    const response = await fetch(this.urlNukeCodes);
    const $ = cheerio.load(await response.text());

    const siteNames: string[] = [];
    const keyCodes: number[] = [];
    const dates = $('#nuclearcodess tr:nth-child(2) th')
      .text()
      .replace('Week of', '')
      .trim()
      .split('-');

    $('#nuclearcodess tr:nth-child(3) th').each((_i, h) =>
      siteNames.push($(h).text().toLowerCase()),
    );

    $('#nuclearcodess tr:nth-child(4) td').each((_i, h) => keyCodes.push(parseInt($(h).text())));

    const validFrom = moment(`${dates[0]} 17:00`, 'MM/DD hh:mm').unix();
    const validUntil = moment(`${dates[1]} 17:00`, 'MM/DD hh:mm').unix();
    const nextResetFriendly = moment.unix(validUntil).fromNow();
    const result: INuclearCodes = {validFrom, validUntil, nextResetFriendly, codes: {}};

    siteNames.forEach((site: string, i) => (result.codes[site] = keyCodes[i]));

    return result;
  }

  public async getNews() {
    const response = await fetch(this.bethesdaNewsApiUrl);
    const newsJson = await response.json();

    const newsArray: IFalloutNews[] = newsJson.entries.map((article: any) => {
      return {
        id: article.id,
        blurb: article.blurb,
        title: article.title,
        imageUrl: `https:${article.image}`,
        newsUrl: this.bethesdaBaseUrl + article.url,
        date: article.date,
      };
    });

    return newsArray;
  }
}

export interface INuclearCodes {
  validFrom: number;
  validUntil: number;
  nextResetFriendly: string;
  codes: {
    [key: string]: number;
  };
}

export interface IFalloutNews {
  id: string;
  blurb: string;
  title: string;
  imageUrl: string;
  newsUrl: string;
  date: string;
}
