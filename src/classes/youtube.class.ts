import * as ytdl from 'ytdl-core';

export class DiscordYoutube {
  public playing = false;
  public lastPlayed: string;

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

  public playStream(link: string) {
    this.playing = true;
    return ytdl(link, {filter: 'audioonly'});
  }

  public stopStream() {
    this.playing = false;
  }
}
