import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import {crc32} from 'crc';
import {PersistClass} from '../../classes/persist.class';

const persistApi = new PersistClass();

export class Scraper {
  private readonly storageKey = 'scraperPersist';

  public createScrapeEntry(url: string, body: string, ignoredSelectors: string[]): IScrapeModel {
    const timestamp = new Date().valueOf();
    return {
      url,
      checksum: crc32(body).toString(16),
      length: body.length,
      lastChecked: timestamp,
      lastChanged: timestamp,
      ignoredSelectors,
    };
  }

  public async checkScrapeEntries(url: string): Promise<boolean> {
    const existingScrapeEntries = (await persistApi.get<IScrapeModel[]>(this.storageKey)) || [];
    if (existingScrapeEntries.some(e => e.url === url)) {
      return true;
    }
    return false;
  }

  public async add(url: string, ignoredSelectors?: string): Promise<void> {
    try {
      const ignoreList = ignoredSelectors?.split(',') || [];

      if (await this.checkScrapeEntries(url)) throw new Error('That entry already exists!');
      const response = await fetch(url);
      const body = this.htmlFilterSelectors(await response.text(), ignoreList);
      const newScrapeEntry = this.createScrapeEntry(url, body, ignoreList);
      const existingScrapeEntries = (await persistApi.get<IScrapeModel[]>(this.storageKey)) || [];
      persistApi.set(this.storageKey, [...existingScrapeEntries, newScrapeEntry]);
    } catch (error) {
      throw new Error(`Add new scrape entry failed: ${error}`);
    }
  }

  public async remove(url: string): Promise<void> {
    try {
      if (!(await this.checkScrapeEntries(url))) throw new Error(`That entry doesn't exist`);
      const existingScrapeEntries = (await persistApi.get<IScrapeModel[]>(this.storageKey)) || [];
      existingScrapeEntries.filter((e, i) => {
        if (e.url === url) existingScrapeEntries.splice(i, 1);
      });
      persistApi.set(this.storageKey, existingScrapeEntries);
    } catch (error) {
      throw new Error(`Add new scrape entry failed: ${error}`);
    }
  }

  public async check(): Promise<IScrapeModel[]> {
    const existingScrapeEntries = (await persistApi.get<IScrapeModel[]>(this.storageKey)) || [];
    const refreshedScrapeEntries = [];
    const scrapedEntriesWithChanges = [];

    for (const item of existingScrapeEntries) {
      try {
        const response = await fetch(item.url);
        const newBody = this.htmlFilterSelectors(await response.text(), item.ignoredSelectors);
        const currentTimestamp = new Date().valueOf();
        const newChecksum = crc32(newBody).toString(16);

        item.lastChecked = currentTimestamp;
        /**
         * If body length is same as before, do a CRC check just to make sure.
         */
        if (newBody.length === item.length) {
          if (newChecksum !== item.checksum) {
            item.lastChanged = currentTimestamp;
            item.checksum = newChecksum;
            item.changeType = 'Checksum';
            scrapedEntriesWithChanges.push(item);
          }
        } else {
          item.lastChanged = currentTimestamp;
          item.length = newBody.length;
          item.checksum = newChecksum;
          item.changeType = 'Length';
          scrapedEntriesWithChanges.push(item);
        }
        refreshedScrapeEntries.push(item);
      } catch (error) {
        console.error(error);
      }
    }
    persistApi.set(this.storageKey, refreshedScrapeEntries);
    return scrapedEntriesWithChanges;
  }

  /**
   * Filters user defined selectors from the scraped html. This can be used to
   * avoid false negatives that can arise from cache busting attributes or tickers.
   * @param html the html string to operate on
   * @param ignoredSelectors user defined list of selectors to ignore
   */
  public htmlFilterSelectors(html: string, ignoredSelectors: string[]): string {
    const $ = cheerio.load(html);
    $(`${ignoredSelectors.join(', ')}`).each((_, e) => $(e).remove());
    return $.html();
  }
}

export interface IScrapeModel {
  url: string;
  checksum: string;
  length: number;
  lastChecked: number;
  lastChanged: number;
  changeType?: 'Checksum' | 'Length';
  ignoredSelectors: string[];
}
