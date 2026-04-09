import { EmbedBuilder } from '@fluxerjs/core';
import { Colors, Emojis, RankingEmojis } from '#lib/constants';
import { formatDecimal, link } from '#lib/utils';
import { Beatmap, Ruleset, type Score, type User } from 'osu-api-v2-js';
import { calculateBeatmap, calculateDifficulty, formatGameMode, formatMods, } from './osu.js';

export function buildOsuProfileEmbed(user: User.Extended): EmbedBuilder {
    const team = user.team
        ? ` **Team:** [${user.team.short_name}](https://osu.ppy.sh/teams/${user.team.id})`
        : '';

    const ranks = [
        `${RankingEmojis.XH} \`${user.statistics.grade_counts.ssh.toLocaleString()}\``,
        `${RankingEmojis.X} \`${user.statistics.grade_counts.ss.toLocaleString()}\``,
        `${RankingEmojis.SH} \`${user.statistics.grade_counts.sh.toLocaleString()}\``,
        `${RankingEmojis.S} \`${user.statistics.grade_counts.s.toLocaleString()}\``,
        `${RankingEmojis.A} \`${user.statistics.grade_counts.a.toLocaleString()}\``,
    ];

    const accuracy = formatDecimal(user.statistics.accuracy * 100);

    let peakRankLine = 'N/A';
    if (user.rank_highest) {
        const peakRank = user.rank_highest.rank.toLocaleString();
        const peakRankTimestamp = (user.rank_highest.updated_at.getTime() / 1000).toFixed();
        peakRankLine = `#${peakRank} achieved <t:${peakRankTimestamp}:R>`;
    }

    const playtimeHours = (user.statistics.play_time! / 60 / 60).toFixed();
    const gamemode = formatGameMode(user.playmode);

    return new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({
            name: `${gamemode} Profile for ${user.username}`,
            iconURL: `https://osuflags.omkserver.nl/${user.country_code}.png`,
            url: `https://osu.ppy.sh/users/${user.id}`,
        })
        .setThumbnail(user.avatar_url)
        .setDescription([
            `▸ **Rank:** #${user.statistics.global_rank?.toLocaleString()} (${user.country_code}#${user.statistics.country_rank?.toLocaleString()})`,
            `▸ **Peak Rank:** ${peakRankLine}`,
            `▸ **Level:** ${user.statistics.level.current} + ${user.statistics.level.progress}%${team}`,
            `▸ **PP:** ${user.statistics.pp?.toLocaleString()} **Accuracy:** ${accuracy}%`,
            `▸ **Playcount:** ${user.statistics.play_count.toLocaleString()} (${playtimeHours} hours)`,
            `▸ **Score Ranks:** ${ranks.join(' ')}`,
        ].join('\n'));
}

export async function buildScoreEmbed(score: Score.WithUserBeatmapBeatmapset): Promise<EmbedBuilder> {
    const calc = await calculateBeatmap(score.beatmap_id, score);
    const fcPP = calc.fcPP ? ` ~~(${formatDecimal(calc.fcPP)}pp)~~` : '';
    const stars = formatDecimal(calc.stars);

    const rankEmote = score.passed
        ? RankingEmojis[score.rank as keyof typeof RankingEmojis]
        : RankingEmojis.F;

    const pp = score.pp
        ? formatDecimal(score.pp)
        : formatDecimal(calc.currentPP);

    const mods = formatMods(score.mods);

    const line1 = [
        `${rankEmote} +**${mods.length ? mods : 'NM'}**`,
        `**${score.total_score.toLocaleString()}**`,
        `**${formatDecimal(score.accuracy * 100)}%**`,
        `<t:${(score.ended_at.getTime() / 1000).toFixed()}:R>`,
    ].join(' • ');

    const line2 = [
        `**${pp}**/${formatDecimal(calc.maxPP)}PP${fcPP}`,
        `**${score.max_combo.toLocaleString()}x**/${calc.maxCombo.toLocaleString()}x`,
        score.statistics.miss && `${score.statistics.miss}${Emojis.Miss}`
    ].filter(Boolean).join(' • ');

    return new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(`${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}] [${stars}★]`)
        .setThumbnail(`https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`)
        .setAuthor({
            name: score.user.username,
            iconURL: score.user.avatar_url,
            url: `https://osu.ppy.sh/users/${score.user.id}`,
        })
        .setURL(score.beatmap.url)
        .setDescription([line1, line2].join('\n'));
}

export async function buildScoresList(scores: Score.WithUserBeatmapBeatmapset[]): Promise<string[]> {
    let index = 0;
    const lines = [];

    for (const score of scores) {
        const diff = await calculateDifficulty(score.beatmap_id, score);
        const beatmapTitle = `[**${score.beatmapset.title} [${score.beatmap.version}]**](${score.beatmap.url})`;
        const rankEmote = score.passed ? RankingEmojis[score.rank as keyof typeof RankingEmojis] : RankingEmojis.F;
        const mods = formatMods(score.mods);
        const accuracy = formatDecimal(score.accuracy * 100);
        const pp = formatDecimal(score.pp!);
        const stars = formatDecimal(diff.stars);
        const title = `**#${++index}** ${beatmapTitle} [${stars}★]`;
        const date = `<t:${(score.ended_at.getTime() / 1000).toFixed()}:R>`;
        const miss = score.ruleset_id !== Ruleset.mania && score.statistics.miss ? ` ${score.statistics.miss}${Emojis.Miss}` : '';
        let text = `${title}\n${rankEmote} **${pp}pp** (${accuracy}%) [${score.max_combo}x/${diff.maxCombo}x]${miss} **+${mods || 'NM'}** ${date}`;

        if (score.ruleset_id === Ruleset.mania) {
            const ratio = score.statistics.great ? `${formatDecimal((score.statistics.perfect ?? 0) / score.statistics.great)}:1` : '∞:1';
            text += `\n${score.total_score.toLocaleString()} [${score.statistics.perfect ?? 0}/${score.statistics.great ?? 0}/${score.statistics.good ?? 0}/${score.statistics.ok ?? 0}/${score.statistics.meh ?? 0}/${score.statistics.miss ?? 0}] ${ratio}`;
        }

        lines.push(text);
    }

    return lines;
}

export function buildMostPlayedEmbed(user: User, beatmaps: Beatmap.Playcount[]) {
    const lines = [];

    for (const { count, beatmap, beatmapset } of beatmaps) {
        const url = `https://osu.ppy.sh/b/${beatmap.id}`;
        const title = link(`${beatmapset.artist} - ${beatmapset.title} ${beatmap.version}`, url);
        const stars = `[${formatDecimal(beatmap.difficulty_rating)}★]`;

        lines.push(`**[${count}]** ${title} ${stars}`);
    }

    return new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({
            name: `Most played beatmaps for ${user.username}`,
            iconURL: user.avatar_url,
            url: `https://osu.ppy.sh/users/${user.id}`
        })
        .setDescription(lines.join('\n'));
}
