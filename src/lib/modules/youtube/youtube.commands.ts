import * as Discord from 'discord.js';
import {DiscordYoutube} from './youtube.class';
import {DiscordBotCommand} from 'typings/discord.js';

const yt = new DiscordYoutube();
const botUtils = require('../../classes/utlities.class');

const subcommands = [
  {
    name: 'play',
    usage: 'Start playback. Invokee must be in a voice channel.',
    execute: async function (target: Discord.Message, args: string[]) {
      if (target.channel!.type !== 'text') return;

      const track = args[0];

      const voiceChannel = target.member!.voice.channel;
      if (!voiceChannel) {
        target.channel.send('Please join a voice channel first!');
        return;
      }

      if (await yt.isValidVideo(track)) {
        voiceChannel.join().then(connection => {
          yt.playing = true;

          yt.playStream(track).then(stream => {
            const dispatcher = connection.play(stream);

            dispatcher.on('start', () => {
              target.client.user?.setActivity(yt.nowPlaying.title, {
                type: 'LISTENING',
                url: yt.nowPlaying.url,
              });
            });

            dispatcher.on('finish', () => stop());
            dispatcher.on('stop', () => stop());
            dispatcher.on('error', () => stop());
          });
        });
      } else {
        target.channel.send('No valid video found for that request.');
      }
    },
  },
  {
    name: 'stop',
    usage: 'Stop playback.',
    execute: async function (target: Discord.Message) {
      const voiceChannel = target.member!.voice.channel;
      yt.playing = false;
      target.client.user?.setActivity('', {});
      if (voiceChannel) voiceChannel.leave();
    },
  },
];

const botCommand: DiscordBotCommand = {
  name: 'youtube',
  description: `Play & record Youtube audio`,
  usage: botUtils.generateCommandUsageString(subcommands),
  aliases: ['yt'],
  args: true,
  categories: ['Fun'],
  subcommands,
  execute: botUtils.commandModuleExecutor(subcommands),
};

export = botCommand;
