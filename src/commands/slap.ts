import * as Discord from 'discord.js';
import {DiscordBotCommand} from '../bot';
import * as Canvas from 'canvas';

const botCommand: DiscordBotCommand = {
  name: 'slap',
  description: `Slap the dice. Let fate decide.`,
  cooldown: 5,
  aliases: ['slapdice'],
  execute: async (message: Discord.Message): Promise<void> => {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    try {
      const background = await Canvas.loadImage('./assets/images/omar.jpg');

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

      message.channel.send(attachment);
    } catch (e) {
      console.log(e);
    }
  },
};

export = botCommand;
