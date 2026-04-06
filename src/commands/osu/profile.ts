import { type CommandConfig } from '#lib/command';
import { buildOsuProfileEmbed } from '#lib/embeds';
import { getOsuUser } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

// TODO: Aliases like >osu >mania >catch >taiko

export const config: CommandConfig = {
    description: 'View an osu! profile',
    aliases: ['osu', 'osuprofile']
};

export async function run(message: Message, args: string[]) {
    const user = await getOsuUser(message, args[0]);
    if (!user) return;

    await message.reply({
        embeds: [buildOsuProfileEmbed(user)]
    });
}
