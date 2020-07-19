import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import fetch from 'node-fetch';
import * as Discord from 'discord.js';
import {DiscordSubCommand} from 'typings/discord.js';

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
): Promise<Discord.MessageAttachment> {
  const response = await fetch(url);
  const content = await response.buffer();
  return new Discord.MessageAttachment(content, name);
}

export async function attachmentFromFile(
  filePath: string,
  name = 'attachment',
): Promise<Discord.MessageAttachment> {
  const asyncReadFile = util.promisify(fs.readFile);
  const data = await asyncReadFile(filePath);

  return new Discord.MessageAttachment(data, name);
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
  constructor(private modPath: string) {}

  public walkFiles = walkFiles;
  public attachmentFromUrl = attachmentFromUrl;
  public randomItemFromArray = randomItemFromArray;
  public generateCommandUsageString = generateCommandUsageString;

  public async attachmentFromFile(
    filePath: string,
    name = 'attachment',
  ): Promise<Discord.MessageAttachment> {
    const attachmentPath = path.join(this.modPath, filePath);
    const asyncReadFile = util.promisify(fs.readFile);
    const data = await asyncReadFile(attachmentPath);

    return new Discord.MessageAttachment(data, name);
  }
}
