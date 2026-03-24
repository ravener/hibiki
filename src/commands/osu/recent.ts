import { type CommandConfig, type CommandContext } from '#lib/command';
import { Colors, Emojis, RankingEmojis } from '#lib/constants';
import { api, calculateBeatmap, formatGameMode, formatMods } from '#lib/osu';
import { formatDecimal, getOsuUser } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

export const config: CommandConfig = {
    description: 'Get user\'s most recent gameplay. Mode defaults to set default gamemode.',
    aliases: ['r', 'rm', 'rc', 'rs', 'rt'],
    extendedHelp: 'Use one of the aliases to change the game mode:\n* `>rm` for osu!mania\n* `>rc` for osu!catch\n* `>rs` for osu! standard\n* `>rt` for osu!taiko'
};

const aliasToRuleset: Record<string, Ruleset> = {
    'rm': Ruleset.mania,
    'rc': Ruleset.fruits,
    'rs': Ruleset.osu,
    'rt': Ruleset.taiko
};


export async function run(message: Message, args: string[], ctx: CommandContext) {
    const user = await getOsuUser(message, args[0]);
    if (!user) return;

    const ruleset = aliasToRuleset[ctx.alias];
    const scores = await api.getUserScores(user.id, 'recent', ruleset, { fails: true });
    const score = scores[0];

    if (!score) {
        await message.reply(`No recent plays found for user **${user.username}**`);
        return;
    }

    const calc = await calculateBeatmap(score.beatmap_id, score);
    const mods = formatMods(score.mods);
    const rankEmote = score.passed ? RankingEmojis[score.rank as keyof typeof RankingEmojis] : RankingEmojis.F;
    const accuracy = formatDecimal(score.accuracy * 100);
    const pp = score.pp ? formatDecimal(score.pp) : formatDecimal(calc.currentPP);
    const fcPP = calc.fcPP ? ` ~~(${formatDecimal(calc.fcPP)}pp)~~` : '';
    const miss = score.statistics.miss ? ` • ${score.statistics.miss} ${Emojis.Miss}` : '';

    const content = `Recent **${formatGameMode(score.ruleset_id)}** play for **${user.username}**`;
    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle(`${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}] [${formatDecimal(calc.stars)}★]`)
        .setThumbnail(`https://b.ppy.sh/thumb/${score.beatmapset.id}l.jpg`)
        .setAuthor({ name: user.username, iconURL: user.avatar_url, url: `https://osu.ppy.sh/users/${user.id}` })
        .setURL(score.beatmap.url)
        .setDescription([
            `${rankEmote} +**${mods.length ? mods : 'NM'}** • **${score.total_score.toLocaleString()}** • **${accuracy}%** • <t:${(score.ended_at.getTime() / 1000).toFixed()}:R>`,
            `**${pp}**/${formatDecimal(calc.maxPP)}PP${fcPP} • **${score.max_combo.toLocaleString()}x**/${calc.maxCombo.toLocaleString()}x${miss}`,
        ].join('\n'));

    await message.reply({ content, embeds: [embed] });
}
