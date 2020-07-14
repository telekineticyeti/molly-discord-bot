import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import {walkFiles} from './classes/utlities.class';

dotenv.config();

/**
 * Set up environment info and bot configuration
 */
let env: EnvironmentInfo = {
  mode: 'Development',
  commandsFolder: './src',
  commandFileRegex: /\.(js|ts)$/,
  token: process.env.TOKEN!,
  prefix: process.env.PREFIX || '!',
};

if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('Production') > -1) {
  env = {...env, mode: 'Production', commandsFolder: './dist', commandFileRegex: /\.(js)$/};
}

/**
 * Create the bot client and parse command files
 */
const bot: DiscordBotCommandExtension = new Discord.Client();
bot.commands = new Discord.Collection();

const commandFiles = walkFiles(`${env.commandsFolder}/commands`).filter(file =>
  file.match(env.commandFileRegex),
);

for (let file of commandFiles) {
  file = file.replace(env.commandsFolder, './');
  const command = require(file);
  bot.commands.set(command.name, command);
  console.info(`Command Module Loaded: ${command.name} [${command.description}]`);
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user!.tag} in ${env.mode} mode!`);
});

bot.on('message', message => {
  if (!message.content.startsWith(env.prefix) || message.author.bot) return;

  const args = message.content.slice(env.prefix.length).split(/ +/);
  const commandName = args.shift()!.toLowerCase();

  if (!bot.commands) return;

  const command =
    bot.commands.get(commandName) ||
    bot.commands.find(cmd => cmd.aliases! && cmd.aliases!.includes(commandName));

  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    message.reply('Bweee wooo <:sadMoops:728756268474302536>');
  }
});

bot.login(env.token);

export interface DiscordBotCommandExtension extends Discord.Client {
  commands?: Discord.Collection<string, DiscordBotCommand>;
}

interface EnvironmentInfo {
  mode: string;
  commandsFolder: string;
  commandFileRegex: RegExp;
  token: string;
  prefix: string;
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

import {Fo76} from './classes/fo76.class';

const fo76 = new Fo76();

fo76.getNuclearCodes();
