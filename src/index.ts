import 'dotenv/config';

import type { Command } from '#lib/command';
import { Client, Events, Message } from '@fluxerjs/core';
import { readdir } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OwnerId } from '#lib/constants';
import { getPrefix } from '#lib/db';
import { aliases, commands, handleCommands } from '#lib/command-handler';

const client = new Client({ intents: 0 });

async function loadCommands() {
    const baseDir = fileURLToPath(dirname(import.meta.url));
    const files = await readdir(join(baseDir, 'commands'), { recursive: true });

    for (const file of files) {
        if (!file.endsWith('.js')) continue;

        const { config, run } = await import(join(baseDir, 'commands', file)) as Partial<Command>;
        const { name } = parse(file);

        if (!run) {
            console.warn(`${file} does not export a run function.`);
            continue;
        }

        const command: Command = {
            config: { name, ...config },
            run
        };

        commands.set(command.config.name!, command);

        // register aliases
        if (command.config.aliases) {
            command.config.aliases.forEach(alias => aliases.set(alias, command.config.name!));
        }
    }
}

client.on(Events.Ready, () => {
    console.log(`Ready! Logged in as ${client.user!.username}`);
});

client.on(Events.MessageCreate, async (message: Message) => {
    await handleCommands(message);
});

await loadCommands();
console.log(`Loaded ${commands.size} commands`);
await client.login(process.env.TOKEN!);
