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
const bot = new Discord.Client();
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
  // schedule();
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

interface EnvironmentInfo {
  mode: string;
  commandsFolder: string;
  commandFileRegex: RegExp;
  token: string;
  prefix: string;
}

// const schedule = () => {
//   const testConfig = [
//     {
//       time: '* * * * *',
//       destinations: [{guildId: '726891390683841064', channelId: '731911474737578015'}],
//       command: '',
//     },
//   ];

//   const configJson = JSON.stringify(testConfig);

//   const config = JSON.parse(configJson);

//   console.log(config);

//   function test() {
//     const c = bot.channels.cache.get('731911474737578015');
//     c!.send('asdf');
//   }

//   test();
// };
