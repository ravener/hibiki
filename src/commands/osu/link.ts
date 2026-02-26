import { type CommandConfig } from '#lib/command';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Link your osu! account'
};

export async function run(message: Message, args: string[]) {
    const username = args[0];

    if (!username) {
        await message.reply('You need to provide a username to link.');
        return;
    }

    // TODO
}
