import { type CommandConfig } from '#lib/command';
import { Colors, Emojis, RankingEmojis } from '#lib/constants';
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

    const beatmap = await api.getBeatmap(score.beatmap_id);
    const mods = score.mods.map(mod => mod.acronym).join('');
    const rankEmote = score.passed ? RankingEmojis[score.rank as keyof typeof RankingEmojis] : RankingEmojis.F;

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(`${score.beatmapset.title} [${score.beatmap.version}] [${score.beatmap.difficulty_rating.toFixed(2)}★]`)
        .setThumbnail(`https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`)
        .setAuthor({ name: user.username, iconURL: user.avatar_url, url: `https://osu.ppy.sh/users/${user.id}` })
        .setURL(score.beatmap.url)
        .setDescription([
            `${rankEmote} +**${mods}** • **${score.total_score.toLocaleString()}** • **${(score.accuracy * 100).toFixed(2)}%** • <t:${(score.ended_at.getTime() / 1000).toFixed()}:R>`,
            `**${score.pp?.toFixed(2)}PP** • **${score.max_combo.toLocaleString()}x**/${beatmap.max_combo.toLocaleString()}x • ${score.statistics.miss} ${Emojis.Miss}`,
        ].join('\n'));

    await message.reply({ embeds: [embed] });
}
