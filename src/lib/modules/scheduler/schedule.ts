import {ScheduleConfig} from 'typings/discord.js';
import {FlightRisingHelpers} from '../flight-rising/flight-rising.helpers';

const frHelpers = new FlightRisingHelpers();

const channelDropPod = '732370971104641024';
// const testChannel = '731911474737578015';

const scheduler: ScheduleConfig[] = [
  {
    name: 'Flight Rising Daily Exalt Bonuses',
    cronTime: '15 8 * * *',
    execute: client => {
      return async () => {
        if (!client) return;
        try {
          const channel = client.channels.cache.get(channelDropPod);
          const embed = await frHelpers.buildExaltBonusEmbed();
          channel!.send(embed);
        } catch (error) {
          console.error(error);
        }
      };
    },
  },
];

export = scheduler;
