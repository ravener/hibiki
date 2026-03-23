import { type CommandConfig, type CommandContext } from '#lib/command';
import { Colors, Emojis, RankingEmojis } from '#lib/constants';
import { api, calculateDifficulty, formatGameMode, formatMods } from '#lib/osu';
import { formatDecimal, getOsuUser } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

export const config: CommandConfig = {
    description: 'View a player\'s top plays.',
    aliases: [
        't',
        'topmania', 'tm',
        'topcatch', 'tc',
        'toptaiko', 'tt'
    ]
};

const aliasToRuleset: Record<string, Ruleset> = {
    't': Ruleset.osu,
    'topmania': Ruleset.mania,
    'tm': Ruleset.mania,
    'topcatch': Ruleset.fruits,
    'tc': Ruleset.fruits,
    'toptaiko': Ruleset.taiko,
    'tt': Ruleset.taiko
};


export async function run(message: Message, args: string[], ctx: CommandContext) {
    const user = await getOsuUser(message, args[0]);
    if (!user) return;

    const ruleset = aliasToRuleset[ctx.alias];
    const topPlays = await api.getUserScores(user.id, 'best', ruleset, undefined, { limit: 10 });

    if (!topPlays.length) {
        await message.reply(`No top plays found for user **${user.username}**`);
        return;
    }

    // TODO: Ability to change pages.
    let index = 0;
    const lines = [];
    for (const score of topPlays.slice(0, 10)) {
        const diff = await calculateDifficulty(score.beatmap_id, score);
        const beatmapTitle = `[**${score.beatmapset.title} [${score.beatmap.version}]**](${score.beatmap.url})`;
        const rankEmote = score.passed ? RankingEmojis[score.rank as keyof typeof RankingEmojis] : RankingEmojis.F;
        const mods = formatMods(score.mods);
        const accuracy = formatDecimal(score.accuracy * 100);
        const pp = formatDecimal(score.pp!);
        const stars = formatDecimal(diff.stars);
        const title = `**#${++index}** ${beatmapTitle} [${stars}★]`;
        const date = `<t:${(score.ended_at.getTime() / 1000).toFixed()}:R>`;
        const miss = score.ruleset_id !== Ruleset.mania && score.statistics.miss ? ` ${score.statistics.miss} ${Emojis.Miss}` : '';
        let text = `${title}\n${rankEmote} **${pp}pp** (${accuracy}%) [${score.max_combo}x/${diff.maxCombo}x]${miss} **+${mods || 'NM'}** ${date}`;

        if (score.ruleset_id === Ruleset.mania) {
            const ratio = score.statistics.great ? `${formatDecimal((score.statistics.perfect ?? 0) / score.statistics.great)}:1` : '∞:1';
            text += `\n${score.total_score.toLocaleString()} [${score.statistics.perfect ?? 0}/${score.statistics.great ?? 0}/${score.statistics.good ?? 0}/${score.statistics.ok ?? 0}/${score.statistics.meh ?? 0}/${score.statistics.miss ?? 0}] ${ratio}`;
        }

        lines.push(text);
    }

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({
            name: `Top ${formatGameMode(ruleset ?? Ruleset[user.playmode])} Plays for ${user.username}`,
            iconURL: `https://osuflags.omkserver.nl/${user.country_code}.png`,
            url: `https://osu.ppy.sh/users/${user.id}`
        })
        .setThumbnail(user.avatar_url)
        .setDescription(lines.join('\n'));

    await message.reply({ embeds: [embed] });
}
