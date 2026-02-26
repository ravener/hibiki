import { type CommandConfig } from '#lib/command';
import { Colors, RankingEmojis } from '#lib/constants';
import { api } from '#lib/osu';
import { getOsuUser } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Get user\'s most recent gameplay. Mode defaults to set default gamemode.'
};

export async function run(message: Message, args: string[]) {
    const user = await getOsuUser(message, args[0]);
    if (!user) return;

    const scores = await api.getUserScores(user.id, 'recent');
    const score = scores[0];

    if (!score) {
        await message.reply(`No recent plays found for user **${user.username}**`);
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(score.beatmapset.title)
        .setThumbnail(`https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`)
        .setAuthor({ name: user.username, iconURL: user.avatar_url, url: `https://osu.ppy.sh/users/${user.id}` })
        .setURL(`https://osu.ppy.sh/b/${score.beatmapset.id}`)
        .setDescription(`▸ ${RankingEmojis[score.rank as keyof typeof RankingEmojis]}`);

    await message.reply({ embeds: [embed] });
}
