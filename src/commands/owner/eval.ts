import type { CommandConfig } from '#lib/command';
import type { Message } from '@fluxerjs/core';
import { inspect } from 'node:util';

export const config: CommandConfig = {
    description: 'Evaluates arbitrary JavaScript',
    ownerOnly: true
};

export async function run(message: Message, args: string[]) {
    if (!args.length) {
        await message.reply("Please provide some code to evaluate.");
        return;
    }

    const code = args.join(' ');
    try {
        let output = await eval(code);
        output = inspect(output, { depth: 0, maxArrayLength: null });

        if (output.length > 1990) {
            await message.reply('Output too long.');
            return;
        }

        await message.reply(`\`\`\`js\n${output}\n\`\`\``);
    } catch (err: unknown) {
        await message.reply(`Error: \`\`\`\n${err}\n\`\`\``);
    }
}
