import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import {BotUtils} from './lib/classes/utlities.class';
import {ScheduleClass} from './lib/modules/scheduler/schedule.class';
const scheduleClass: ScheduleClass = require('./lib/modules/scheduler/schedule.class');
const botUtils = new BotUtils(__dirname);

dotenv.config();

/**
 * Set up environment info and bot configuration
 */
let env: EnvironmentInfo = {
  mode: 'Development',
  baseFolder: './src',
  // TODO: on prod this regex is not working for some reason.
  commandFileRegex: /(commands?)\.(js|ts)$/,
  commandModuleFolders: [],
  token: process.env.TOKEN!,
  prefix: process.env.PREFIX || '!',
};

/**
 * Sets the environment to production or development (default). The biggest difference this
 * makes is to wether core modules are loaded from `./src` or `./dist`.
 */
if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('Production') > -1) {
  env = {...env, mode: 'Production', baseFolder: './dist', commandFileRegex: /\.(js)$/};
}

/**
 * Setup references to additional folders where the bot will look for command modules.
 */
env.commandModuleFolders =
  process.env.MODULEDIRS?.split(',').map(m => `${env.baseFolder}/${m}`) || [];

/**
 * Create the bot client
 */
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

/**
 * Import bot command files
 */
(async () => {
  /**
   * Resolve command module files for each given path.
   * @param paths array of path strings
   */
  const resolveCommandModuleFiles = (paths: string[]) => {
    let files: string[] = [];

    paths.map(path => {
      try {
        files = [
          ...files,
          ...botUtils.walkFiles(path).filter(file => file.match(env.commandFileRegex)),
        ];
      } catch (error) {
        console.warn(`Could not resolve module path ${path}\n`, error);
      }
    });

    return files;
  };

  const commandModuleFiles = [...resolveCommandModuleFiles(env.commandModuleFolders)];

  for (let file of commandModuleFiles) {
    file = file.replace(env.baseFolder, '.');

    try {
      const command = await import(file);
      if (command.name) {
        bot.commands!.set(command.name, command);
        console.info(`Command Module Loaded: ${command.name}`);
      }
    } catch (error) {
      console.warn(`Could not resolve module ${file}\n`, error);
    }
  }
})();

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user!.tag} in ${env.mode} mode!`);
  scheduleClass.setupScheduledTasks(bot);
});

bot.on('message', message => {
  scheduleClass.checkListeners(message);

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
    console.error(error);
    message.reply('`Bweee wooo :(`');
  }
});

bot.login(env.token);

interface EnvironmentInfo {
  mode: string;
  baseFolder: string;
  commandFileRegex: RegExp;
  token: string;
  prefix: string;
  commandModuleFolders: string[];
}
