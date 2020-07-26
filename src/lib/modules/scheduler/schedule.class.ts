import * as cron from 'node-cron';
import * as events from 'events';
import {Channel, Client, Message} from 'discord.js';

export class ScheduleClass {
  public listeners: IListener[] = [];
  public dispatcher = new events.EventEmitter();

  constructor() {
    // TODO
    // SetInterval Cleanup
  }

  public registerListener(item: IListener): void {
    this.listeners.push(item);
  }

  public unregisterListener(item: IListener): void {
    let index = -1;
    this.listeners.some((listener, idx) => {
      if (JSON.stringify(listener) === JSON.stringify(item)) {
        index = idx;
        return true;
      }
      return;
    });

    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  public listenerCleanup(): void {}

  public listenerDispatch(listener: IListener, message: string): void {
    this.dispatcher.emit(listener.userId, message);
  }

  public checkListeners(message: Message): void {
    const listener = this.listeners.find(item => {
      const triggerIndex = item.triggers.indexOf(message.content);
      if (triggerIndex > -1 && item.userId === message.author.id) {
        return item;
      }
      return;
    });
    if (listener) {
      this.listenerDispatch(listener, message.content);
    }
  }

  /**
   * Reads the scheduled tasks file and sets up each defined task.
   * @param client The client (bot) instance.
   */
  public async setupScheduledTasks(client: Client) {
    const scheduler = await import('./schedule');
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

export interface IListener {
  // id: number;
  triggers: string[];
  userId: string;
  metadata?: any;
  // expiry: number;
}

const exp = new ScheduleClass();

module.exports = exp;
