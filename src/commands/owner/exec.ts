import { type CommandConfig } from '#lib/command';
import { type Message } from '@fluxerjs/core';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

const execAsync = promisify(exec);

export const config: CommandConfig = {
    description: 'Executes shell commands',
    ownerOnly: true
};

export async function run(message: Message, args: string[]) {
    const result = await execAsync(args.join(' '), { timeout: 60000 })
    .catch(error => ({ stdout: null, stderr: error }));

    const output = result.stdout ? `**\`OUTPUT\`**${'```prolog\n' + result.stdout + '```'}` : '';
    const outerr = result.stderr ? `**\`ERROR\`**${'```prolog\n' + result.stderr + '```'}` : '';

    if (output === '' && outerr === '') {
        await message.reply('No output returned.');
        return;
    }

    const results = [output, outerr].join('\n');

    if (results.length > 2000) {
      await message.reply(`Output too long.`);
      return;
    }

    await message.reply(results);
}
