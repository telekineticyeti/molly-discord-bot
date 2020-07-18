import * as Discord from 'discord.js';
import {DiscordYoutube} from './youtube.class';
import {DiscordBotCommand} from 'typings/discord.js';

const yt = new DiscordYoutube();

const usage =
  `\`subcommand\` \`(Youtube URL or ID)\`\n` + // \`start time\` \`end time\`\n`
  `\n` +
  `**Available sub-commands:**\n` +
  `\`play\` - Start playback. Invokee must be in a voice channel.\n` +
  `\`stop\` - Stop playback.\n`;
// `\`save\` - Save the video's audio and attach it to the channel. ***TBA***\n`;

const botCommand: DiscordBotCommand = {
  name: 'youtube',
  description: `Play & record Youtube audio`,
  usage,
  aliases: ['yt'],
  cooldown: 5,
  args: true,
  categories: ['Fun'],
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

          yt.playStream(track).then(stream => {
            const dispatcher = connection.play(stream);

            dispatcher.on('start', () => {
              message.client.user?.setActivity(yt.nowPlaying.title, {
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
        error('No valid video found for that request.');
      }
    };

    const stop = () => {
      yt.playing = false;
      message.client.user?.setActivity('', {});
      if (voiceChannel) voiceChannel.leave();
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
