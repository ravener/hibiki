import { handleCommands } from '#lib/command-handler';
import { buildOsuProfileEmbed, buildScoreEmbed } from '#lib/embeds';
import { api } from '#lib/osu';
import type { Client, Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

const userRegex = /^http(?:s)?:\/\/osu.ppy.sh\/users\/([^\/\s]+)(?:\/(osu|fruits|taiko|mania)(?:\/)?)?/;
const scoreRegex = /^http(?:s)?:\/\/osu.ppy.sh\/scores\/([^\/\s]+)(?:\/)?/;

async function handleScoreLink(message: Message) {
    const match = message.content.match(scoreRegex);
    if (!match) return;

    const scoreId = parseInt(match[1]!);
    if (isNaN(scoreId)) return;
    const score = await api.getScore(scoreId);

    await message.reply({
        embeds: [await buildScoreEmbed(score)]
    });
}

async function handleUserLink(message: Message) {
    const match = message.content.match(userRegex);
    if (!match) return;

    const userId = match[1]!;
    const gameMode = match[2];

    const rulesetMap: Record<string, Ruleset> = {
        osu: Ruleset.osu,
        fruits: Ruleset.fruits,
        taiko: Ruleset.taiko,
        mania: Ruleset.mania
    };
    const ruleset = gameMode ? rulesetMap[gameMode] : undefined;

    const user = await api.getUser(!isNaN(parseInt(userId)) ? parseInt(userId) : userId, ruleset);
    await message.reply({
        embeds: [buildOsuProfileEmbed(user, ruleset ?? user.playmode)]
    });
}

export async function run(client: Client, message: Message) {
    await handleCommands(message);
    await handleUserLink(message);
    await handleScoreLink(message);
}
