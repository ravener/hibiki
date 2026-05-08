import { handleCommands } from '#lib/command-handler';
import { buildOsuProfileEmbed } from '#lib/embeds';
import { api } from '#lib/osu';
import type { Client, Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

const regex = /^http(?:s)?:\/\/osu.ppy.sh\/users\/([^\/\s]+)(?:\/(osu|fruits|taiko|mania)(?:\/)?)?/;
async function handleUserLink(message: Message) {
    const match = message.content.match(regex);
    if (!match) return;

    const userId = match[1]!;
    const gameMode = match[2] ? match[2].toLowerCase() : 'osu';

    const rulesetMap: Record<string, Ruleset> = {
        osu: Ruleset.osu,
        fruits: Ruleset.fruits,
        taiko: Ruleset.taiko,
        mania: Ruleset.mania
    };
    const ruleset = rulesetMap[gameMode] || Ruleset.osu;

    const user = await api.getUser(!isNaN(parseInt(userId)) ? parseInt(userId) : userId, ruleset);
    await message.reply({
        embeds: [buildOsuProfileEmbed(user, ruleset)]
    });
}

export async function run(client: Client, message: Message) {
    await handleCommands(message);
    await handleUserLink(message);
}
