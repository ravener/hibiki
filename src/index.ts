import 'dotenv/config';

import type { Command } from '#lib/command';
import { aliases, commands } from '#lib/command-handler';
import { toProperCase } from '#lib/utils';
import { Client } from '@fluxerjs/core';
import { readdir } from 'node:fs/promises';
import { basename, dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const client = new Client({
    intents: 0,
    presence: {
        custom_status: {
            emoji_id: '1476543520190574790',
            text: 'Clicking circles | >help'
        },
        status: 'online'
    }
});

async function loadCommands() {
    const baseDir = fileURLToPath(dirname(import.meta.url));
    const files = await readdir(join(baseDir, 'commands'), { recursive: true });

    for (const file of files) {
        if (!file.endsWith('.js')) continue;

        const { config, run } = await import(join(baseDir, 'commands', file)) as Partial<Command>;
        const { name, dir } = parse(file);

        if (!run) {
            console.warn(`${file} does not export a run function.`);
            continue;
        }

        const category = toProperCase(basename(dir));
        const command: Command = {
            config: { name, category, ...config },
            run
        };

        commands.set(command.config.name!, command);

        // register aliases
        if (command.config.aliases) {
            command.config.aliases.forEach(alias => aliases.set(alias, command.config.name!));
        }
    }
}

async function loadEvents() {
    const baseDir = fileURLToPath(dirname(import.meta.url));
    const files = await readdir(join(baseDir, 'events'), { recursive: true });

    for (const file of files) {
        if (!file.endsWith('.js')) continue;

        const { run } = await import(join(baseDir, 'events', file));
        const { name } = parse(file);

        if (!run) {
            console.warn(`${file} does not export a run function.`);
            continue;
        }

        client.on(name, async (...args) => {
            try {
                await run(client, ...args);
            } catch (err) {
                console.error(`Error in event '${name}'`, err);
            }
        });
    }
}

await loadCommands();
await loadEvents();

console.log(`Loaded ${commands.size} commands`);
await client.login(process.env.TOKEN!);
