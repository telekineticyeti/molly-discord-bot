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
  categories?: CommandCategory[];
  subcommands?: DiscordSubCommand[];
  execute(message: Discord.Message | Discord.Channel, args?: any): any;
}

export interface DiscordSubCommand {
  name: string;
  usage: string;
  execute(message: Discord.Message | Discord.Channel, args?: any): any;
}

export type CommandCategory = 'Fun' | 'Utility' | 'Info';

export interface ScheduleConfig {
  name: string;
  cronTime: string;
  targetChannel?: string;
  targetUser?: string;
  command?: {
    module: string;
    subcommand?: string;
    args?: string;
  };
  execute?(client?: Discord.Client): any;
}
