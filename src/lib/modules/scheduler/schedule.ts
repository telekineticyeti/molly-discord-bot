import {ScheduleConfig} from 'typings/discord.js';
import {Fo76} from '../fallout76/fo76.class';
import {FlightRising} from '../flight-rising/fllght-rising.class';
import {PersistClass} from '../../classes/persist.class';
import {BotUtils} from '../../classes/utlities.class';

const channelDropPod = '732370971104641024';
const botUtils = new BotUtils(__dirname);
const persist = new PersistClass();
const fo76 = new Fo76();
const fr = new FlightRising();

const scheduler: ScheduleConfig[] = [
  {
    name: 'Flight Rising Daily Exalt Bonuses',
    cronTime: '15 9 * * *',
    targetChannel: channelDropPod,
    command: {module: 'flightrising', subcommand: 'bonus'},
  },
  {
    name: 'Fallout News Checker',
    cronTime: '*/30 * * * *',
    execute: client => {
      if (!client) return;
      return async () => {
        const storageKey = 'FalloutNews';
        const output = () => {
          const channel = client.channels.cache.get(channelDropPod);
          if (!channel) return;

          const command = botUtils.resolveCommand(client, 'fallout76', 'news');
          if (command) command.execute(channel);
        };

        const news = await fo76.getNews();
        const latestNews = news[0];
        const upsertedNews = await persist.upsertOnDiff(storageKey, latestNews);

        if (!upsertedNews || JSON.stringify(upsertedNews) !== JSON.stringify(latestNews)) {
          output();
        }
      };
    },
  },
  {
    name: 'Fallout Status Checker',
    cronTime: '*/5 * * * *',
    execute: client => {
      if (!client) return;
      return async () => {
        const storageKey = 'FalloutStatus';
        const output = () => {
          const channel = client.channels.cache.get(channelDropPod);
          if (!channel) return;

          const command = botUtils.resolveCommand(client, 'fallout76', 'status');
          if (command) command.execute(channel);
        };

        const status = await fo76.getStatus();
        const upsertedNews = await persist.upsertOnDiff(storageKey, status);

        if (!upsertedNews || JSON.stringify(upsertedNews) !== JSON.stringify(status)) {
          output();
        }
      };
    },
  },
  {
    name: 'Flight Rising News Checker',
    cronTime: '*/26 * * * *',
    execute: client => {
      if (!client) return;
      return async () => {
        const storageKey = 'FlightRisingNews';
        const output = () => {
          const channel = client.channels.cache.get(channelDropPod);
          if (!channel) return;

          const command = botUtils.resolveCommand(client, 'flightrising', 'news');
          if (command) command.execute(channel);
        };

        const latestNews = await (await fr.getFrontPage()).news[0];
        const upsertedNews = await persist.upsertOnDiff(storageKey, latestNews);

        if (!upsertedNews || JSON.stringify(upsertedNews) !== JSON.stringify(latestNews)) {
          output();
        }
      };
    },
  },

  {
    name: 'Flight Rising Dev Updates Checker',
    cronTime: '*/27 * * * *',
    execute: client => {
      if (!client) return;
      return async () => {
        const storageKey = 'FlightRisingUpdates';
        const output = () => {
          const channel = client.channels.cache.get(channelDropPod);
          if (!channel) return;

          const command = botUtils.resolveCommand(client, 'flightrising', 'updates');
          if (command) command.execute(channel);
        };

        const latestUpdate = await (await fr.getFrontPage()).updates[0];
        const upsertedUpdate = await persist.upsertOnDiff(storageKey, latestUpdate);

        if (!upsertedUpdate || JSON.stringify(upsertedUpdate) !== JSON.stringify(latestUpdate)) {
          output();
        }
      };
    },
  },
];

export = scheduler;
