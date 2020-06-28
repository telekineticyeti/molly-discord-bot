import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

bot.login(TOKEN);

const getDeepDives = (): Promise<string> => {
  return new Promise(async resolve => {
    const response = await fetch('https://www.reddit.com/r/DeepRockGalactic/hot/.json?limit=0');
    const responseBody = await response.json();

    const f = responseBody.data.children.filter(
      (element: IRedditListingChild) =>
        element.data.stickied && element.data.title.match('Weekly Deep Dives Thread'),
    );

    resolve(formatDeepDive(f[0].data));
  });
};

const formatDeepDive = (postObject: IRedditThread): string | undefined => {
  const regex = new RegExp(/\*{2}Deep Dive\*{2}(.*)\*{2}Elite Deep Dive\*{2}/is);
  let details = postObject.selftext.match(regex);

  if (!details) {
    return;
  }

  const detailsExploded = details[0].split('|'); // Remove any double line breaks
  // /(\n){2}/

  // Strip junk strings
  const exp = detailsExploded.map(
    ele => ele.split('**').join('').replace('Elite Deep Dive', '').trim(), // hacky ugh
  );

  const str = `
  \`\`\`
    Deep Dive '${exp[1]}' @ ${exp[2]}
    ------------------------------
    Stage ${exp[12]}: Objectives: ${exp[13]} + ${exp[14]}. Warnings: ${exp[15]}. Anomalies: ${exp[16]}
    Stage ${exp[17]}: Objectives: ${exp[18]} + ${exp[19]}. Warnings: ${exp[20]}. Anomalies: ${exp[21]}
    Stage ${exp[22]}: Objectives: ${exp[23]} + ${exp[24]}. Warnings: ${exp[25]}. Anomalies: ${exp[26]}
  \`\`\`
  `;

  return str;
};

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
  if (msg.content === '!deepdives') {
    const deepDiveInfo = await getDeepDives();
    msg.channel.send(deepDiveInfo);
  }
});

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
