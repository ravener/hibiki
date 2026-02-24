import type { CommandConfig } from '#lib/command';
import type { Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Pong! Check bot latency'
};

export async function run(message: Message) {
    const msg = await message.reply("Ping?");
    const took = msg.createdAt.getTime() - message.createdAt.getTime();
    await msg.edit({ content: `Pong! Took **${took} ms**`});
}
