import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

export class Fo76 {
  public async getNuclearCodes(): Promise<void> {
    const response = await fetch('https://nukacrypt.com/');
    const $ = cheerio.load(await response.text());

    const date = $('#nuclearcodess tr:nth-child(2) th').text().replace('Week of', '').trim();
    // const headers = $('#nuclearcodess tr:nth-child(3) th');
    // const data = $('#nuclearcodess tr:nth-child(4) td');

    // console.log(date);

    const dates = date.split('-');

    console.log(moment(`${dates[0]} 17:00`, 'MM/DD hh:mm').fromNow());
    console.log(moment(`${dates[1]} 17:00`, 'MM/DD hh:mm').fromNow());

    // .each((i, h) => {

    //   // console.log($(h).text()),

    //   const codes = {

    //   }

    //   i 0-2, arr1
    //   i 3-5, arr2

    // }
    // );

    // console.log(test);
    // $('table tr:nth-child(2) table:nth-child(2) tr td:nth-child(2)').text()
  }
}

// interface NuclearCodes {
//   date: string;
//   alpha: number;
//   bravo: number;
//   charlie: number;
// }
