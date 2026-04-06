import type { CommandConfig, CommandContext } from '#lib/command';
import { buildScoreEmbed } from '#lib/embeds';
import { api, formatGameMode } from '#lib/osu';
import { getOsuUser } from '#lib/utils';
import type { Message } from '@fluxerjs/core';
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

    await message.reply({
        content: `Recent **${formatGameMode(score.ruleset_id)}** play for **${user.username}**`,
        embeds: [await buildScoreEmbed(score)]
    });
}
