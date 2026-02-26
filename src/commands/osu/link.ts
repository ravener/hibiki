import { type CommandConfig } from '#lib/command';
import { Colors } from '#lib/constants';
import { users } from '#lib/db';
import { api } from '#lib/osu';
import { EmbedBuilder, type Message } from '@fluxerjs/core';
import { APIError } from 'osu-api-v2-js';

export const config: CommandConfig = {
    description: 'Link your osu! account'
};

export async function run(message: Message, args: string[]) {
    const username = args[0];
    const user = await users.get(message.author.id) ?? {};

    if (!username) {
        await message.reply('You need to provide a username to link.');
        return;
    }

    try {
        const osuUser = await api.getUser(username);
        const osuId = osuUser.id;
        users.set(message.author.id, { ...user, osuId });

        const embed = new EmbedBuilder()
            .setColor(Colors.Primary)
            .setTitle('Link Successful')
            .setAuthor({ name: osuUser.username, iconURL: osuUser.avatar_url })
            .setDescription('Your account has been to successfully linked to Hibiki, commands that require a user will default to your linked account.');

        await message.reply({ embeds: [embed] });
    } catch (err) {
        if (err instanceof APIError) {
            if (err.response?.status_code === 404) {
                await message.reply('Invalid osu! username, I could not find anyone by that name.');
                return;
            }
        }

        throw err;
    }
}
