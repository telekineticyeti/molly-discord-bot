import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as cron from 'node-cron';
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
  constructor(private modPath: string) {}

  public walkFiles = walkFiles;
  public attachmentFromUrl = attachmentFromUrl;
  public randomItemFromArray = randomItemFromArray;
  public generateCommandUsageString = generateCommandUsageString;

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
   * @param filePath Relative path to the local file to attach.
   * @param name The name of the attachment
   */
  public async attachmentFromFile(
    filePath: string,
    name = 'attachment',
  ): Promise<MessageAttachment> {
    const attachmentPath = path.join(this.modPath, filePath);
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

  /**
   * Reads the scheduled tasks file and sets up each defined task.
   * TODO: Move this to it's own class file.
   * @param client The client (bot) instance.
   */
  public async setupScheduledTasks(client: Client) {
    const scheduler = await import('../modules/scheduler/schedule');
    let taskExecutor: () => void;

    scheduler.forEach(scheduledTaskObj => {
      try {
        if (scheduledTaskObj.execute) {
          /**
           * If the schedule object defines an executable function,
           * use this as scheduled action.
           */
          taskExecutor = scheduledTaskObj.execute!(client);
        } else if (scheduledTaskObj.command) {
          /**
           * If the schedule object defines a command object,
           * use this as scheduled action.
           */
          const clientCommand = client.commands?.get(scheduledTaskObj.command.module);

          if (clientCommand) {
            /**
             * Resolve the target for the scheduled task output (channel or user?)
             * TODO: Add support for user as target: `Client.fetchUser(id)`
             */
            let target: Channel | undefined;

            if (scheduledTaskObj.targetChannel) {
              if (client.channels.cache.get(scheduledTaskObj.targetChannel)) {
                target = client.channels.cache.get(scheduledTaskObj.targetChannel);
              }
            }

            if (!target) return;

            if (!scheduledTaskObj.command.subcommand) {
              // Execute the primary command when no subcommand is specified
              taskExecutor = () => clientCommand.execute(target!);
            } else {
              // Executes the subcommand of the primary command module
              const subcommand = clientCommand.subcommands?.filter(
                subcom => subcom.name === scheduledTaskObj.command!.subcommand,
              )[0];

              if (!subcommand) return;

              taskExecutor = () => subcommand.execute(target!);
            }
          }
        } else {
          console.error('No valid task specified for this schedule', scheduledTaskObj);
          return;
        }
        cron.schedule(scheduledTaskObj.cronTime, taskExecutor);
        console.log(`Scheduled task: ${scheduledTaskObj.name} (${scheduledTaskObj.cronTime})`);
      } catch (e) {
        console.error(`Schedule task FAILED: ${scheduledTaskObj.name}: ${e}`);
      }
    });
  }
}

export type DiscordTarget = Message | Channel;
