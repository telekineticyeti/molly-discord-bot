import {ScheduleConfig} from 'typings/discord.js';

const channelDropPod = '732370971104641024';

const scheduler: ScheduleConfig[] = [
  {
    name: 'Flight Rising Daily Exalt Bonuses',
    cronTime: '15 8 * * *',
    targetChannel: channelDropPod,
    command: {module: 'flightrising', subcommand: 'bonus'},
  },
  // {
  //   name: 'Flight Rising Daily Exalt Bonuses',
  //   cronTime: '*/1 * * * *',
  //   execute: client => {
  //     const testChannel = '731911474737578015';
  //     return () => {
  //       if (!client) return;
  //       const channel = client.channels.cache.get(testChannel);
  //       const cmd = client!.commands
  //         ?.get('flightrising')
  //         ?.subcommands?.filter(obj => obj.name === 'time');

  //       cmd![0].execute(channel!);
  //     };
  //   },
  // },
];

export = scheduler;
