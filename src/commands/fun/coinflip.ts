import { type CommandConfig } from '#lib/command';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Flip a coin and see if it lands on Heads or Tails',
    aliases: ['coin', 'cf']
};

export async function run(message: Message, args: string[]) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    await message.reply(`The coin landed on **${result}**`);
}
