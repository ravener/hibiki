import type { CommandConfig } from "#lib/command";
import { guilds } from "#lib/db";
import { PermissionFlags, type Message } from "@fluxerjs/core";

export const config: CommandConfig = {
    description: 'Configure the server\'s prefix',
    guildOnly: true
};

export async function run(message: Message, args: string[]) {
    const config = await guilds.get(message.guildId!) ?? {};

    if (!args.length) {
        await message.reply(`The current prefix is \`${config?.prefix ?? '>'}\``);
        return;
    }

    const member = await message.guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageGuild)) {
        await message.reply('You need the Manage Community permission to change the prefix.');
        return;
    }

    config.prefix = args[0]!;
    await guilds.set(message.guildId!, config);
    await message.reply(`Prefix updated to \`${config.prefix}\``);
}
