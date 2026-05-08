import { type CommandConfig } from '#lib/command';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Roll an n-sided dice (default 100)'
};

export async function run(message: Message, args: string[]) {
    const sides = Math.max(1, Math.min(1000, parseInt(args[0] ?? '100', 10) || 100));
    const result = Math.floor(Math.random() * sides) + 1;
    await message.reply(`You rolled a **${result}** (1-${sides})`);
}
