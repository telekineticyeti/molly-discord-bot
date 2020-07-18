import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import * as Discord from 'discord.js';
import {BotUtils} from '../../classes/utlities.class';

export class Fo76 {
  private botUtils = new BotUtils(__dirname);

  public async getNuclearCodes(): Promise<INuclearCodes> {
    const response = await fetch('https://nukacrypt.com/');
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

    const result: INuclearCodes = {
      validFrom: moment(`${dates[0]} 17:00`, 'MM/DD hh:mm').unix(),
      validUntil: moment(`${dates[1]} 17:00`, 'MM/DD hh:mm').unix(),
      codes: {},
    };

    siteNames.forEach((site: string, i) => (result.codes[site] = keyCodes[i]));

    return result;
  }

  public async composeNuclearCodeMessage(): Promise<Discord.MessageEmbed> {
    const codesData = await this.getNuclearCodes();
    const reset = moment.unix(codesData.validUntil).fromNow();

    const attachment = await this.botUtils.attachmentFromFile(
      './assets/images/bombrider.png',
      'nukes.png',
    );

    const renderCodes = Object.keys(codesData.codes).map(e => ({
      name: e.toLocaleUpperCase(),
      value: codesData.codes[e],
      inline: true,
    }));

    return new Discord.MessageEmbed()
      .setColor('#0000ff')
      .setTitle(`Nuclear Codes`)
      .setDescription(`Nuclear launch codes will reset ***${reset}***`)
      .setURL('https://nukacrypt.com/')
      .addFields(renderCodes)
      .attachFiles([attachment])
      .setThumbnail('attachment://nukes.png');
  }
}

interface INuclearCodes {
  validFrom: number;
  validUntil: number;
  codes: {
    [key: string]: number;
  };
}
