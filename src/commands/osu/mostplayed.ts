import { type CommandConfig } from '#lib/command';
import { buildMostPlayedEmbed } from '#lib/embeds';
import { api } from '#lib/osu';
import { getOsuUser } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'View a user\'s most played beatmaps.',
    aliases: ['mp', 'mostplay']
};

export async function run(message: Message, args: string[]) {
    const user = await getOsuUser(message, args[0]);
    if (!user) return;

    const mostPlayed = await api.getUserMostPlayed(user, { limit: 10 });

    if (!mostPlayed.length) {
        await message.reply(`No beatmaps found for **${user.username}**!`);
    }

    await message.reply({
        embeds: [buildMostPlayedEmbed(user, mostPlayed)]
    });
}
