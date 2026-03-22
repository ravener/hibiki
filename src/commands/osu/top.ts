import { type CommandConfig } from '#lib/command';
import { Colors, RankingEmojis } from '#lib/constants';
import { api, calculateDifficulty, formatMods } from '#lib/osu';
import { getOsuUser } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

export const config: CommandConfig = {
    description: 'View a player\'s top plays.'
};

export async function run(message: Message, args: string[]) {
    const user = await getOsuUser(message, args[0]);
    if (!user) return;

    const gameMode = {
        'osu': 'osu! Standard',
        'fruits': 'osu!catch',
        'mania': 'osu!mania',
        'taiko': 'osu!taiko'
    } as const;

    // TODO: Other game modes
    const topPlays = await api.getUserScores(user.id, 'best', Ruleset.osu, undefined, { limit: 10 });

    if (!topPlays.length) {
        await message.reply(`No top plays found for user **${user.username}**`);
        return;
    }

    // TODO: Ability to change pages.
    let index = 0;
    const text = [];
    for (const score of topPlays.slice(0, 10)) {
        const diff = await calculateDifficulty(score.beatmap_id, score);
        const beatmapTitle = `[**${score.beatmapset.title} [${score.beatmap.version}]**](${score.beatmap.url})`;
        const rankEmote = score.passed ? RankingEmojis[score.rank as keyof typeof RankingEmojis] : RankingEmojis.F;
        const mods = formatMods(score.mods);
        text.push(`**#${++index}** ${beatmapTitle} [${diff.stars.toFixed(2)}★]\n${rankEmote} **${score.pp?.toFixed(2)}pp** (${(score.accuracy * 100).toFixed(2)}%) [${score.max_combo}x/${diff.maxCombo}x] **+${mods || 'NM'}** <t:${(score.ended_at.getTime() / 1000).toFixed()}:R>`);
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({
            name: `Top ${gameMode[user.playmode]} Plays for ${user.username}`,
            iconURL: `https://osuflags.omkserver.nl/${user.country_code}.png`,
            url: `https://osu.ppy.sh/users/${user.id}`
        })
        .setThumbnail(user.avatar_url)
        .setDescription(text.join('\n'));

    await message.reply({ embeds: [embed] });
}
