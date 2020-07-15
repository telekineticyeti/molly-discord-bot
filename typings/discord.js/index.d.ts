import * as Discord from 'discord.js';

declare module 'discord.js' {
  interface Channel {
    send(message: string | Discord.MessageEmbed): Promise<this>;
  }
  interface Client {
    commands?: Discord.Collection<string, DiscordBotCommand>;
  }
}

export interface DiscordBotCommand {
  name: string;
  description?: string;
  cooldown?: number;
  aliases?: string[];
  usage?: string;
  args?: boolean;
  execute(message: Discord.Message, ags: any): any;
}
