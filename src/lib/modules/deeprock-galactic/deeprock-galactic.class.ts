import fetch from 'node-fetch';
import * as Discord from 'discord.js';
import * as moment from 'moment';

const botUtils = require('../../classes/utlities.class');

export class DeepRockBotCommands {
  public vaQuotes: string[] = [
    `THEY'RE COMIN' OUTTA THE KARL-DAMNED WALLS! 🦟`,
    `Hello Darkness My Old Friend, Hahaha!`,
    `Godamnit there is a pebble in my boot 🥾`,
    `Allow me to "illuminate" the situation! Hahahahaha! 😂`,
    `LET THERE BE LOIGHT! 💡`,
    `Looks like poop, smells like poop! 💩`,
    `Guys? Are you blind? Look ovah' here!`,
    `For Karl! 🧔`,
    `Drop pawd isn't waitin' fo'-evuh!`,
    `Rock and Stone to the bone, brother`,
  ];

  /**
   * Resolve weekly deep dives information thread from the /r/deeprockgalactic subreddit.
   */
  public getDeepDives(): Promise<Discord.MessageEmbed> {
    return new Promise(async resolve => {
      const response = await fetch('https://www.reddit.com/r/DeepRockGalactic/hot/.json?limit=0');
      const responseBody = await response.json();

      const filtered = responseBody.data.children.filter(
        (element: IRedditListingChild) =>
          element.data.stickied && element.data.title.match('Weekly Deep Dives Thread'),
      );

      resolve(this.composeDeepDiveEmbed(filtered[0].data));
    });
  }

  /**
   * Formats the deep dive information for display to a channel. The info is delivered
   * as an embed.
   * @param postObject Reddit thread object
   */
  private async composeDeepDiveEmbed(rawPost: IRedditThread): Promise<Discord.MessageEmbed> {
    const regex = new RegExp(/\*{2}Deep Dive\*{2}(.*)\*{2}Elite Deep Dive\*{2}/is);
    let details = rawPost.selftext.match(regex);

    if (!details) {
      throw new Error('Details for deep dives not found or could not be parsed');
    }

    // Explode Reddit table string
    const detailsExploded = details[0].split('|');

    // Strip whitespace and markup strings
    const exp = detailsExploded.map(
      ele => ele.split('**').join('').replace('Elite Deep Dive', '').trim(), // hacky ugh
    );

    const anomaly = (content: string): string => (content !== 'None' ? ` ⚠️ ${content}` : '');
    const warning = (content: string): string => (content !== 'None' ? ` ☠️ ${content}` : '');
    const nextReset = (): string => {
      const now = new Date();
      now.setDate(now.getDate() + ((4 + (7 - now.getDay())) % 7)); // 4 = Thursday

      return moment(now).fromNow();
    };

    const thumbnail = await botUtils.attachmentFromFile(
      __dirname,
      '/assets/images/192px-DeepDive_Icon.png',
      'thumbnail.png',
    );

    const footer = await botUtils.attachmentFromFile(
      __dirname,
      '/assets/images/192px-Mining_expedition_icon.png',
      'footer.png',
    );

    const fields = [
      {
        name: `Stage ${exp[12]}`,
        value: `${exp[13]} + ${exp[14]} \n${anomaly(exp[15])}${warning(exp[16])}`,
      },
      {
        name: `Stage ${exp[17]}`,
        value: `${exp[18]} + ${exp[19]} \n${anomaly(exp[20])}${warning(exp[21])}`,
      },
      {
        name: `Stage ${exp[22]}`,
        value: `${exp[23]} + ${exp[24]} \n${anomaly(exp[25])}${warning(exp[26])}`,
      },
      {
        name: `Next Reset ${nextReset()}`,
        value: `Deep dives and weekly missions reset every Earth Thursday`,
      },
    ];

    return new Discord.MessageEmbed()
      .setColor('#cb6e00')
      .setTitle('Weekly Deep Dive')
      .setURL(rawPost.url)
      .setDescription(`**${exp[1]}** @ ${exp[2]}`)
      .attachFiles([thumbnail, footer])
      .setThumbnail('attachment://thumbnail.png')
      .addFields(fields)
      .setFooter(
        this.vaQuotes[Math.floor(Math.random() * this.vaQuotes.length)],
        'attachment://footer.png',
      )
      .setTimestamp(new Date(rawPost.created_utc * 1000));
  }
}

interface IRedditThread {
  stickied: boolean;
  permalink: string;
  selftext: string;
  url: string;
  created_utc: number;
  author: string;
  title: string;
}

interface IRedditListingChild {
  data: IRedditThread;
}
