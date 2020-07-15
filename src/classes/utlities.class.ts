import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import fetch from 'node-fetch';
import * as Discord from 'discord.js';

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
  const attachmentPath = path.join(__dirname, filePath);
  const asyncReadFile = util.promisify(fs.readFile);
  const data = await asyncReadFile(attachmentPath);

  return new Discord.MessageAttachment(data, name);
}
