import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import {DiscordBotCommand} from 'typings/discord.js';

dotenv.config();

const prefix = process.env.PREFIX!;

const botCommand: DiscordBotCommand = {
  name: 'help',
  description: 'Show available commands',
  aliases: ['commands'],
  categories: ['Utility'],
  execute: (message: Discord.Message, args: string[]): void => {
    const {commands} = message.client;

    if (!commands) return;

    if (!args.length) {
      /**
       * Arrange commands into categories, if a category is specified.
       */
      const commandCategories: ICommandCategories = {};

      commands.forEach(command => {
        let targetCategory;

        // TODO: Support multiple cats.
        if (command.categories) {
          const categorySlug = command.categories[0];

          if (!commandCategories[`${categorySlug}`]) {
            commandCategories[`${categorySlug}`] = [];
          }
          targetCategory = categorySlug;
        }
        if (typeof targetCategory === 'undefined') targetCategory = 'Other';
        commandCategories[`${targetCategory}`].push(command);
      });

      const commandListCats = Object.keys(commandCategories).map(category => {
        return {
          name: category,
          value: commandCategories[category]
            .map(command => `\`${prefix}${command.name}\``)
            .join(', '),
        };
      });

      const helpMessage = new Discord.MessageEmbed()
        .setColor('#ff000')
        .setTitle('Bot Commands')
        .setDescription('Here are a list of my available commands, by category:')
        .addFields(commandListCats);

      message.reply(helpMessage).catch(error => {
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

    const helpMessage = new Discord.MessageEmbed()
      .setColor('#ff000')
      .setTitle(`${prefix}${command.name}`);

    if (command.aliases)
      helpMessage.addField('Aliases', `\`${prefix}${command.aliases.join(', ')}\``);
    if (command.description) helpMessage.setDescription(`${command.description}`);
    if (command.usage) helpMessage.addField('Usage', `${prefix}${command.name} ${command.usage}`);

    message.reply(helpMessage);
  },
};

export = botCommand;

interface ICommandCategories {
  [key: string]: DiscordBotCommand[];
}
