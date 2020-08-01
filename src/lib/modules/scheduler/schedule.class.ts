import * as cron from 'node-cron';
import {Channel, Client} from 'discord.js';

export class ScheduleClass {
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
