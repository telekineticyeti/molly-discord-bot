import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import {DiscordBotCommandExtension, DiscordBotCommand} from 'src/bot';

dotenv.config();

const prefix = process.env.PREFIX!;

const botCommand: DiscordBotCommand = {
  name: 'help',
  description: 'Show available commands',
  aliases: ['commands'],
  execute: (message: Discord.Message, args: string[]): void => {
    const data: string[] = [];
    const {commands} = message.client as DiscordBotCommandExtension;

    if (!commands) return;

    if (!args.length) {
      data.push(`Here's a list of all my commands:`);
      data.push(commands!.map(command => `${prefix}${command.name}`).join(', '));
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`,
      );

      message.author
        .send(data, {split: true})
        .then(() => {
          if (message.channel.type === 'dm') return;
          message.reply("I've sent you a DM with all my commands!");
        })
        .catch(error => {
          console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
          message.reply("it seems like I can't DM you!");
        });
      return;
    }

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) || commands.find(com => com.aliases! && com.aliases!.includes(name));

    if (!command) {
      message.reply("that's not a valid command!");
      return;
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

    message.reply(data, {split: true});
  },
};

export = botCommand;
