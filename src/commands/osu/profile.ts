import { type CommandConfig, type CommandContext } from '#lib/command';
import { buildOsuProfileEmbed } from '#lib/embeds';
import { getOsuUser } from '#lib/utils';
import { type Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

// TODO: Aliases like >osu >mania >catch >taiko

export const config: CommandConfig = {
    description: 'View an osu! profile',
    extendedHelp: 'Use aliases to switch game modes',
    aliases: ['osu', 'osuprofile', 'mania', 'catch', 'ctb', 'taiko']
};

const aliasToRuleset: Record<string, Ruleset> = {
    'mania': Ruleset.mania,
    'catch': Ruleset.fruits,
    'ctb': Ruleset.fruits,
    'taiko': Ruleset.taiko
};

export async function run(message: Message, args: string[], ctx: CommandContext) {
    const ruleset = aliasToRuleset[ctx.alias] ?? Ruleset.osu;
    const user = await getOsuUser(message, args[0], ruleset);
    if (!user) return;

    await message.reply({
        embeds: [buildOsuProfileEmbed(user, ruleset)]
    });
}
