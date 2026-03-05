import { type CommandConfig, type CommandContext } from '#lib/command';
import { commands } from '#lib/command-handler';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Update the bot.',
    ownerOnly: true
};

export async function run(message: Message, args: string[], ctx: CommandContext) {
    const exec = commands.get('exec')!;
    await exec.run(message, ['git pull && npx tsc'], ctx);
    const shutdown = commands.get('shutdown')!;
    await shutdown.run(message, [], ctx);
}
