import { handleCommands } from '#lib/command-handler';
import { buildBeatmapEmbed, buildOsuProfileEmbed, buildScoreEmbed } from '#lib/embeds';
import { api } from '#lib/osu';
import type { Client, Message } from '@fluxerjs/core';
import { Ruleset } from 'osu-api-v2-js';

const userRegex = /^https?:\/\/osu.ppy.sh\/users\/([^\/\s]+)(?:\/(osu|fruits|taiko|mania)(?:\/)?)?/;
const scoreRegex = /^https?:\/\/osu.ppy.sh\/scores\/([^\/\s]+)(?:\/)?/;
const beatmapRegex = /https?:\/\/osu\.ppy\.sh\/(?:beatmapsets\/(\d+)(?:#(?:osu|fruits|taiko|mania)\/(\d+))?|beatmaps\/(\d+))/;

async function handleBeatmapLink(message: Message) {
    const match = message.content.match(beatmapRegex);
    if (!match) return;

    const beatmapsetId = match?.[1] ? Number(match[1]) : undefined;
    const beatmapId = match?.[2] || match?.[3]
        ? Number(match[2] ?? match[3])
        : undefined;

    if (beatmapId && !isNaN(beatmapId)) {
        const beatmap = await api.getBeatmap(beatmapId);

        await message.reply({
            embeds: [buildBeatmapEmbed(beatmap)]
        });

        return;
    }

    // TODO
    // const beatmapSet = await api.getBeatmapset(beatmapsetId);
}

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
    await handleBeatmapLink(message);
}
