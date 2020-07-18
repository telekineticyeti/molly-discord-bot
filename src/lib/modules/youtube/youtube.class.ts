import * as ytdl from 'ytdl-core';
import {Readable} from 'stream';

export class DiscordYoutube {
  public playing = false;
  public lastPlayed: string;

  public nowPlaying: INowPlaying;

  /**
   * Check validity of a supplied Youtube video URL or ID
   * @param link video URL or ID
   */
  public isValidVideo(link: string): Promise<Boolean> {
    const hostRegex = new RegExp(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/);
    const idRegex = new RegExp(/^[a-zA-Z0-9-_]{11}$/);

    return new Promise(resolve => {
      if (!link.match(hostRegex)) {
        if (!link.match(idRegex)) resolve(false);
        link = `https://www.youtube.com/watch?v=${link}`;
      }

      ytdl
        .getBasicInfo(link)
        .then(_ => resolve(true))
        .catch(_ => resolve(false));
    });
  }

  public async playStream(link: string): Promise<Readable> {
    this.playing = true;

    const info = await ytdl.getBasicInfo(link);

    this.nowPlaying = {
      uploader: info.videoDetails.ownerChannelName,
      title: info.videoDetails.title,
      category: info.videoDetails.category,
      thumbnail: info.videoDetails.thumbnail.thumbnails[2].url,
      views: parseInt(info.videoDetails.viewCount),
      likes: info.videoDetails.likes,
      dislikes: info.videoDetails.dislikes,
      url: info.videoDetails.video_url,
    };

    return ytdl(link, {filter: 'audioonly'});
  }

  public stopStream() {
    this.playing = false;
  }

  // public trackInformation() {

  // }
  //   bot.on('ready', () => {
  //     bot.user.setStatus('available')
  //     bot.user.setPresence({
  //         game: {
  //             name: 'with depression',
  //             type: "STREAMING",
  //             url: "https://www.twitch.tv/monstercat"
  //         }
  //     });
  // })
}

interface INowPlaying {
  uploader: string;
  title: string;
  category: string;
  thumbnail: string;
  views: number;
  likes?: number;
  dislikes?: number;
  url: string;
}
