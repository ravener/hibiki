import { handleCommands } from '#lib/command-handler';
import type { Client, Message } from '@fluxerjs/core';

export async function run(client: Client, message: Message) {
    await handleCommands(message);
}
