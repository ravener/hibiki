import { type CommandConfig } from '#lib/command';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Shutdown/Restart the bot',
    ownerOnly: true,
    aliases: ['restart']
};

export async function run(message: Message, args: string[]) {
    await message.reply('Shutting down...');

    await message.client.destroy();
    process.exit();
}
