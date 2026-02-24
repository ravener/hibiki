import 'dotenv/config';

import type { Command } from '#lib/command';
import { Client, Events, Message } from '@fluxerjs/core';
import { readdir } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OwnerId } from '#lib/constants';
import { getPrefix } from '#lib/db';

const client = new Client({ intents: 0 });
const commands = new Map<string, Command>();
const aliases = new Map<string, string>();

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
    if (message.author.bot || message.author.system || message.webhookId) return;
    const prefix = message.guildId ? await getPrefix(message.guildId) ?? ">" : ">";
    if (!message.content.startsWith(prefix)) return;

    const [cmdName, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
    if (!cmdName) return;
    const command = commands.get(cmdName) || commands.get(aliases.get(cmdName)!);

    if (!command) return;
    if (command.config.ownerOnly && message.author.id !== OwnerId) return;
    await command.run(message, args);
});

await loadCommands();
await client.login(process.env.TOKEN!);
