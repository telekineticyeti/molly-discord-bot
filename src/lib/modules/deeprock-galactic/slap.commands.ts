import * as Discord from 'discord.js';
import * as Canvas from 'canvas';
import {DiscordBotCommand} from 'typings/discord.js';

const pipLocations: IPipCoords = {
  1: [[75, 75, 8, 0]],
  2: [
    [50, 50, 8, 0],
    [90, 100, 8, 0],
  ],
  3: [
    [75, 75, 8, 0],
    [50, 50, 8, 0],
    [100, 100, 8, 0],
  ],
  4: [
    [50, 50, 8, 0],
    [100, 50, 8, 0],
    [50, 100, 8, 0],
    [100, 100, 8, 0],
  ],
  5: [
    [50, 50, 8, 0],
    [100, 50, 8, 0],
    [50, 100, 8, 0],
    [100, 100, 8, 0],
    [75, 75, 8, 0],
  ],
  6: [
    [50, 50, 8, 0],
    [50, 75, 8, 0],
    [100, 50, 8, 0],
    [50, 100, 8, 0],
    [100, 100, 8, 0],
    [100, 75, 8, 0],
  ],
};

const drawPips = (value: number, ctx: Canvas.CanvasRenderingContext2D, offset: number = 0) => {
  const pips = pipLocations[value];

  pips.forEach(pip => {
    // Shadow
    ctx.beginPath();
    ctx.arc(pip[0] + 3 + offset, pip[1] + 3, pip[2], pip[3], 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0, .25)';
    ctx.fill();

    // Pip
    ctx.beginPath();
    ctx.arc(pip[0] + offset, pip[1], pip[2], pip[3], 2 * Math.PI);
    ctx.fillStyle = '#ffe6e3';
    ctx.fill();
  });
};

const getRandomInt = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

const botCommand: DiscordBotCommand = {
  name: 'slap',
  description: `Slap the dice. Let fate decide.`,
  cooldown: 5,
  aliases: ['slapdice'],
  execute: async (message: Discord.Message): Promise<void> => {
    const canvas = Canvas.createCanvas(250, 150);
    const ctx = canvas.getContext('2d');

    try {
      const die = await Canvas.loadImage(`${__dirname}/assets/images/fuzzydie.png`);
      ctx.drawImage(die, 25, 20, 100, 122);
      ctx.drawImage(die, 140, 20, 100, 122);

      drawPips(getRandomInt(), ctx);
      drawPips(getRandomInt(), ctx, 115);

      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'diceslap.png');
      message.channel.send(attachment);
    } catch (e) {
      console.error(e);
    }
  },
};

export = botCommand;

interface IPipCoords {
  [key: number]: number[][];
}
