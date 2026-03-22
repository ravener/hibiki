import { type CommandConfig } from '#lib/command';
import { Colors, RankingEmojis } from '#lib/constants';
import { formatDecimal, getOsuUser } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

// TODO: Aliases like >osu >mania >catch >taiko

export const config: CommandConfig = {
    description: 'View an osu! profile',
    aliases: ['osu', 'osuprofile']
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

    const team = user.team ? ` **Team:** [${user.team.short_name}](https://osu.ppy.sh/teams/${user.team.id})` : '';
    const ranks = [
        `${RankingEmojis.XH} \`${user.statistics.grade_counts.ssh.toLocaleString()}\``,
        `${RankingEmojis.X} \`${user.statistics.grade_counts.ss.toLocaleString()}\``,
        `${RankingEmojis.SH} \`${user.statistics.grade_counts.sh.toLocaleString()}\``,
        `${RankingEmojis.S} \`${user.statistics.grade_counts.s.toLocaleString()}\``,
        `${RankingEmojis.A} \`${user.statistics.grade_counts.a.toLocaleString()}\``
    ];

    const accuracy = formatDecimal(user.statistics.accuracy * 100);

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({
            name: `${gameMode[user.playmode]} Profile for ${user.username}`,
            iconURL: `https://osuflags.omkserver.nl/${user.country_code}.png`,
            url: `https://osu.ppy.sh/users/${user.id}`
        })
        .setThumbnail(user.avatar_url)
        .setDescription([
            `▸ **Bancho Rank:** #${user.statistics.global_rank?.toLocaleString()} (${user.country_code}#${user.statistics.country_rank?.toLocaleString()})`,
            `▸ **Peak Rank:** #${user.rank_highest?.rank.toLocaleString()} achieved <t:${(user.rank_highest!.updated_at.getTime() / 1000).toFixed()}:R>`,
            `▸ **Level:** ${user.statistics.level.current} + ${user.statistics.level.progress}%${team}`,
            `▸ **PP:** ${user.statistics.pp?.toLocaleString()} **Accuracy:** ${accuracy}%`,
            `▸ **Playcount:** ${user.statistics.play_count.toLocaleString()} (${(user.statistics.play_time! / 60 / 60).toFixed()} hours)`,
            `▸ **Ranks:** ${ranks.join(' ')}`
        ].join('\n'));

    await message.reply({ embeds: [embed] });
}
