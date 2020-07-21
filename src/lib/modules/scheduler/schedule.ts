import {ScheduleConfig} from 'typings/discord.js';
import {Fo76} from '../fallout76/fo76.class';
import {PersistClass} from '../../classes/persist.class';
import {BotUtils} from '../../classes/utlities.class';

const channelDropPod = '732370971104641024';
const botUtils = new BotUtils(__dirname);
const persist = new PersistClass();
const fo76 = new Fo76();

const scheduler: ScheduleConfig[] = [
  {
    name: 'Flight Rising Daily Exalt Bonuses',
    cronTime: '15 8 * * *',
    targetChannel: channelDropPod,
    command: {module: 'flightrising', subcommand: 'bonus'},
  },
  {
    name: 'Fallout News Checker',
    cronTime: '* */25 * * *',
    execute: client => {
      if (!client) return;
      return async () => {
        const storageKey = 'FalloutNews';

        const output = () => {
          console.log('attempting output');
          const channel = client.channels.cache.get(channelDropPod);
          if (!channel) return;

          const command = botUtils.resolveCommand(client, 'fallout76', 'news');
          if (command) command.execute(channel);
        };

        const news = await fo76.getNews();
        const latestNews = news[0];
        const upsertedNews = await persist.upsertOnDiff(storageKey, latestNews);

        if (JSON.stringify(upsertedNews) !== JSON.stringify(latestNews)) {
          output();
        }
      };
    },
  },
];

export = scheduler;
