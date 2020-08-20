import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import fetch from 'node-fetch';
import {DiscordSubCommand} from 'typings/discord.js';
import {MessageAttachment, Message, Channel, MessageEmbed, Client} from 'discord.js';

/**
 * Output files, recurse through directories
 * @param dir startin directory
 */
export function walkFiles(dir: string): string[] {
  var results: string[] = [];
  var list = fs.readdirSync(dir);

  list.forEach(file => {
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkFiles(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

export async function attachmentFromUrl(
  url: string,
  name = 'attachment',
): Promise<MessageAttachment> {
  const response = await fetch(url);
  const content = await response.buffer();
  return new MessageAttachment(content, name);
}

export async function attachmentFromFile(
  filePath: string,
  name = 'attachment',
): Promise<MessageAttachment> {
  const asyncReadFile = util.promisify(fs.readFile);
  const data = await asyncReadFile(filePath);

  return new MessageAttachment(data, name);
}

export function randomItemFromArray(array: any[]): unknown {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function generateCommandUsageString(subcommands: DiscordSubCommand[]): string {
  let usageString = `\`subcommand\`\n` + `\n` + `**Available sub-commands:**\n`;

  subcommands.forEach(
    subcommand => (usageString += `\`${subcommand.name}\` - ${subcommand.usage}\n`),
  );

  return usageString;
}

export class BotUtils {
  public walkFiles = walkFiles;
  public attachmentFromUrl = attachmentFromUrl;
  public randomItemFromArray = randomItemFromArray;
  public generateCommandUsageString = generateCommandUsageString;
  public env: EnvironmentInfo;

  private instanceOfMessage = (obj: any) => 'channel' in obj;
  private instanceOfChannel = (obj: any) => 'send' in obj;

  /**
   *
   * @param target The target for the message. Either channel, message instance or user
   * @param message The message content.
   */
  public renderMessage(target: Message | Channel, message: string | MessageEmbed) {
    if (this.instanceOfMessage(target)) (target as Message).channel.send(message);
    if (this.instanceOfChannel(target)) (target as Channel).send(message);
  }

  /**
   * Create a message attachment from a local file.
   * @param modPath The relative path to the mod location. Usually `__dirname`.
   * @param filePath Path to the local file, relative to the modPath
   * @param name The name of the attachment
   */
  public async attachmentFromFile(
    modPath: string,
    filePath: string,
    name = 'attachment',
  ): Promise<MessageAttachment> {
    const attachmentPath = path.join(modPath, filePath);
    const asyncReadFile = util.promisify(fs.readFile);
    const data = await asyncReadFile(attachmentPath);
    return new MessageAttachment(data, name);
  }

  /**
   * Resolve a command or sub-command registered with the discord bot.
   * @param client The client (bot) instance
   * @param moduleToSearch The primary command module to search.
   * @param subCommandToSearch (optional) The sub-command to search under the primary command.
   */
  public resolveCommand(client: Client, moduleToSearch: string, subCommandToSearch?: string) {
    if (!client.commands) {
      console.error(`The client has no loaded commands.`);
      return;
    }

    const module = client.commands.get(moduleToSearch);
    if (!module) {
      console.error(`The command module \`${moduleToSearch}\` was not found.`);
      return;
    }

    if (!subCommandToSearch) {
      return module;
    }

    if (!module?.subcommands || !module?.subcommands?.length) {
      console.error(`The \`${moduleToSearch}\` module command does not contain sub-commands.`);
      return;
    }

    const subCommand = module?.subcommands?.filter(obj => obj.name === subCommandToSearch);
    if (!subCommand.length) {
      console.error(
        `The \`${moduleToSearch}\` module did not contain a \`${subCommandToSearch}\` sub-command.`,
      );
      return;
    }

    return subCommand[0];
  }

  public commandModuleExecutor(subcommands: DiscordSubCommand[]) {
    const execute = (message: Message, args: string[]) => {
      if (!args.length) {
        message.reply(
          'That command requires a subcommand. Use `!help` on this command for available subcommands.',
        );
        return;
      }

      const invokeSubCommand = subcommands.filter(subcommand => {
        return subcommand.name === args[0];
      });

      if (invokeSubCommand.length) {
        const subcommandArgs = args;
        subcommandArgs.shift();
        invokeSubCommand[0].execute(message, subcommandArgs);
      } else {
        message.channel.send(`Sub command \`${args[0]}\` was not found, or is not yet implemented`);
      }
    };

    return execute;
  }

  public setEnvironment(env: Partial<EnvironmentInfo>): void {
    this.env = {...this.env, ...env};
  }
}

export type DiscordTarget = Message | Channel;

interface EnvironmentInfo {
  mode: 'Development' | 'Production';
  baseFolder: string;
  commandFileRegex: RegExp;
  token: string;
  prefix: string;
  commandModuleFolders: string[];
  botRootPath: string;
}

/**
 * Exporting an instance of this class as the default export will allow us
 * to re-use this class in other files by using require.
 */
const botUtils = new BotUtils();
module.exports = botUtils;
