import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

/**
 * Set up environment info and bot configuration
 */
let env: EnvironmentInfo = {
  mode: 'Development',
  commandsFolder: './src',
  commandFileRegex: /\.(js|ts)$/,
  token: process.env.TOKEN!,
  prefix: process.env.PREFIX!,
};

if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('Production') > -1) {
  env = {...env, mode: 'Production', commandsFolder: './dist', commandFileRegex: /\.(js)$/};
}

/**
 * Create the bot client and parse command files
 */
const bot: DiscordBotCommandExtension = new Discord.Client();
bot.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync(`${env.commandsFolder}/commands`)
  .filter(file => file.match(env.commandFileRegex));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user!.tag} in ${env.mode} mode!`);
});

bot.on('message', message => {
  if (!message.content.startsWith(env.prefix) || message.author.bot) return;

  const args = message.content.slice(env.prefix.length).split(/ +/);
  const commandName = args.shift()!.toLowerCase();

  if (!bot.commands || !bot.commands.has(commandName)) return;

  const command = bot.commands.get(commandName);

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
  execute(message: Discord.Message, ags: any): any;
}
