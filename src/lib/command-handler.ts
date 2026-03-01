import { EmbedBuilder, Message } from "@fluxerjs/core";
import type { Command } from "./command.js";
import { Channels, Colors, OwnerId } from "./constants.js";
import { guilds } from "./db.js";

export const commands = new Map<string, Command>();
export const aliases = new Map<string, string>();

export function getCommand(name: string) {
    return commands.get(name) || commands.get(aliases.get(name)!);
}

export async function getPrefix(guildId?: string | null) {
    if (!guildId) return '>';
    const config = await guilds.get(guildId);
    return config?.prefix || '>';
}

async function matchPrefix(message: Message, prefix: string) {
    const prefixes = [prefix, `<@${message.client.user?.id}>`];

    for (const prefix of prefixes) {
        if (message.content.startsWith(prefix)) {
            return prefix;
        }
    }
}

async function reportError(err: unknown, message: Message, command: string) {
    const text = err instanceof Error ? err.stack ?? err.toString() : String(err);
    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setTitle('Command Error')
        .setDescription(`An error occurred in command: ${command}\n\`\`\`js\n${text}\n\`\`\``)
        .setFooter({
            text: `User Id: ${message.author.id}, Guild: ${message.guildId}`
        });

    await message.sendTo(Channels.Errors, { embeds: [embed] }).catch(() => null);
}

export async function handleCommands(message: Message) {
    if (message.webhookId || message.author.system || message.author.bot) return;
    const prefix = await getPrefix(message.guildId);

    if (message.content === message.client.user?.toString()) {
        await message.reply(`Hi, I\'m Hibiki, you can get started by running \`${prefix}help\``);
        return;
    }

    const matchedPrefix = await matchPrefix(message, prefix);
    if (!matchedPrefix) return;

    // TODO: Flags parsing
    const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
    const alias = args.shift()?.toLowerCase();
    const command = alias ? getCommand(alias) : undefined;

    if (!command) return;

    if (command.config.guildOnly && !message.guildId) {
        await message.reply('This command can only be used in a server.');
        return;
    }

    if (command.config.ownerOnly && message.author.id !== OwnerId) {
        return;
    }

    try {
        await command.run(message, args);
    } catch (err) {
        if (typeof err === 'string') {
            await message.reply(err);
            return;
        }

        await message.reply('An unknown error occurred, it has been reported to the developer, we\'ll fix it as soon as we can.');
        await reportError(err, message, command.config.name!);
    }
}
