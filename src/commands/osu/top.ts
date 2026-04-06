import { type CommandConfig, type CommandContext } from '#lib/command';
import { Colors } from '#lib/constants';
import { buildScoresList } from '#lib/embeds';
import { api, formatGameMode } from '#lib/osu';
import { getOsuUser } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

export const config: CommandConfig = {
    description: 'View a player\'s top plays.',
    extendedHelp: 'Use the different aliases to change the gamemode shown.',
    aliases: [
        't',
        'topmania', 'tm',
        'topcatch', 'tc',
        'toptaiko', 'tt'
    ]
};

const aliasToRuleset: Record<string, Ruleset> = {
    'top': Ruleset.osu,
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
    const scores = topPlays.slice(0, 10);
    const formattedScores = await buildScoresList(scores);

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({
            name: `Top ${formatGameMode(ruleset ?? Ruleset[user.playmode])} Plays for ${user.username}`,
            iconURL: `https://osuflags.omkserver.nl/${user.country_code}.png`,
            url: `https://osu.ppy.sh/users/${user.id}`
        })
        .setThumbnail(user.avatar_url)
        .setDescription(formattedScores.join('\n'));

    await message.reply({ embeds: [embed] });
}
