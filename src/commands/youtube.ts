import * as Discord from 'discord.js';
import {DiscordYoutube} from '../classes/youtube.class';
import {DiscordBotCommand} from 'typings/discord.js';

const yt = new DiscordYoutube();

const usage = `**command** [_Youtube URL_ or _Youtube Video ID_] [_start tine_] [_end time_]
**Available !yt Commands:**
***play*** - Play the video. Must be in a voice channel.
***stop*** - Stop the video.
***save*** - Save the video's audio and attach it to the channel. (NOT YET IMPLEMENTED)
`;

const botCommand: DiscordBotCommand = {
  name: 'yt',
  description: `Play / Record Youtube audio`,
  usage,
  aliases: ['youtube'],
  cooldown: 5,
  args: true,
  execute: (message: Discord.Message, args: string[]) => {
    if (message.channel.type !== 'text') return;

    if (!args.length) {
      message.reply('This command requires a subcommand. See help for details.');
      return;
    }

    const voiceChannel = message.member!.voice.channel;

    const play = async (track: string) => {
      if (!voiceChannel) {
        error('Please join a voice channel first!');
        return;
      }

      if (await yt.isValidVideo(track)) {
        voiceChannel.join().then(connection => {
          yt.playing = true;
          const dispatcher = connection.play(yt.playStream(track));
          dispatcher.on('finish', () => {
            yt.playing = false;
            voiceChannel.leave();
          });
        });
      } else {
        error('No valid video found for that request.');
      }
    };

    const stop = () => {
      if (!voiceChannel) return;
      yt.playing = false;
      voiceChannel.leave();
    };

    const error = (error: string) => {
      message.channel.send(error);
    };

    switch (args[0]) {
      case 'play':
        play(args[1]);
        break;
      case 'stop':
        stop();
        break;
      default:
        error('Sub-command is incorrect or not yet implemented.');
        break;
    }
  },
};

export = botCommand;
