import * as osu from 'osu-api-v2-js';
import { Beatmap, Difficulty, DifficultyAttributes, GameMode, Performance } from 'rosu-pp-js';
import { BeatmapCache } from './beatmap-cache.js';
import { join } from 'node:path';

const CLIENT_ID = parseInt(process.env.OSU_CLIENT_ID!);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET!;

export const api = new osu.API(CLIENT_ID, CLIENT_SECRET);
export const beatmapCache = new BeatmapCache(join(process.cwd(), 'beatmap-cache'));

/**
 * Format mod objects in a human readable way.
 * @param mods Mods
 * @returns Formatted mods i.e DTHD
 */
export function formatMods(mods: osu.Mod[]): string {
    const modStrings = mods.map(mod => {
        if (mod.settings?.speed_change) {
            return `${mod.acronym}(${mod.settings.speed_change}x)`;
        }

        return mod.acronym;
    });

    return modStrings.join('');
}

/**
 * Fetches a raw .osu beatmap file for the given beatmap id
 * @param id - Beatmap ID
 */
export async function fetchBeatmap(id: number): Promise<string> {
    const cache = await beatmapCache.getBeatmap(id);
    if (cache) {
        return cache;
    }

    const response = await fetch(`https://osu.ppy.sh/osu/${id}`);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const beatmap = await response.text();
    await beatmapCache.saveBeatmap(id, beatmap);
    return beatmap;
}

/**
 * Parses a raw beatmap for performance calculation.
 * @param map Beatmap raw text data
 * @returns Beatmap object, don't forget to .free() it
 */
export function parseMap(map: string) {
    const beatmap = new Beatmap(map);

    if (beatmap.isSuspicious()) {
        throw new Error('Beatmap is suspicious and may not be parsed correctly.');
    }

    return beatmap;
}

export async function calculateDifficulty(id: number, score: osu.Score) {
    const beatmap = await fetchBeatmap(id).then(parseMap);

    if (score.ruleset_id !== osu.Ruleset.osu) {
        // two different types but they both use number gamemodes so force cast it.
        beatmap.convert(score.ruleset_id as unknown as GameMode);
    }

    const lazer = !score.legacy_score_id;
    const diffAttrs = new Difficulty({ mods: score.mods, lazer }).calculate(beatmap);

    const stars = diffAttrs.stars;
    const maxCombo = diffAttrs.maxCombo;

    diffAttrs.free();
    beatmap.free();
    return { stars, maxCombo };
}

// This is taken from Bathbot
// https://github.com/MaxOhn/Bathbot/blob/755bc1a5216ef09ab0cf5496239a83004c55e37d/bathbot-util/src/ext/score.rs#L52
export function isFC(score: osu.Score, maxCombo: number): boolean {
    if ((score.statistics.miss && score.statistics.miss > 0) || score.rank === 'F') {
        return false;
    }

    if (score.ruleset_id === osu.Ruleset.osu) {
        if (score.statistics.large_tick_miss && score.statistics.large_tick_miss > 0) {
            return false;
        }

        // Allow 1 missed sliderend per 500 combo
        return score.max_combo >= Math.max(maxCombo - (maxCombo / 500), 4);
    }

    if (score.ruleset_id === osu.Ruleset.fruits) {
        return score.max_combo === maxCombo;
    }

    return true;
}

// This is taken from Bathbot
// https://github.com/MaxOhn/Bathbot/blob/755bc1a5216ef09ab0cf5496239a83004c55e37d/bathbot/src/util/osu.rs#L449
function calculateFC(beatmap: Beatmap, attrs: DifficultyAttributes, score: osu.Score): number | null {
    const great = score.statistics.great ?? 0;
    const ok = score.statistics.ok ?? 0;
    const meh = score.statistics.meh ?? 0;
    const miss = score.statistics.miss ?? 0;

    if (attrs.mode === GameMode.Osu) {
        const totalObjects = beatmap.nObjects;
        const passedObjects = great + ok + meh + miss;

        let n300 = great + Math.max(0, totalObjects - passedObjects);

        const countHits = totalObjects - miss;
        const ratio = 1.0 - (n300 / countHits);
        const new100s = Math.ceil(ratio * miss);

        n300 += Math.max(0, miss - new100s);
        const n100 = ok + new100s;
        const n50 = meh;

        const ppAttrs = new Performance({
            lazer: !score.legacy_score_id,
            mods: score.mods,
            n300,
            n100,
            n50,
            sliderEndHits: score.statistics.slider_tail_hit ?? 0,
            smallTickHits: score.statistics.small_tick_hit ?? 0
        }).calculate(attrs);

        return ppAttrs.pp;
    }

    if (attrs.mode === GameMode.Taiko) {
        const totalObjects = beatmap.nCircles;
        const passedObjects = great + ok + miss;

        let n300 = great + Math.max(0, totalObjects - passedObjects);

        const countHits = totalObjects - miss;
        const ratio = 1.0 - (n300 / countHits);
        const new100s = Math.ceil(ratio * miss);

        n300 += Math.max(0, miss - new100s);
        const n100 = ok + new100s;

        const accuracy = 100.0 * (2 * n300 + n100) / (2 * totalObjects);

        const ppAttrs = new Performance({
            mods: score.mods,
            accuracy
        }).calculate(attrs);

        return ppAttrs.pp;
    }

    if (attrs.mode === GameMode.Catch) {
        const totalObjects = attrs.maxCombo;
        const passedObjects = great + ok + miss;

        const missing = totalObjects - passedObjects;
        const missingFruits = Math.max(0, missing - Math.max(0, (attrs.nDroplets ?? 0) - ok));
        const missingDroplets = missing - missingFruits;

        const nFruits = great + missingFruits;
        const nDroplets = ok + missingDroplets;
        const nTinyDropletMisses = Math.max(score.statistics.small_tick_miss ?? 0, score.statistics.good ?? 0);
        const nTinyDroplets = Math.max(0, (attrs.nTinyDroplets ?? 0) - nTinyDropletMisses);

        const ppAttrs = new Performance({
            mods: score.mods,
            n300: nFruits,
            n100: nDroplets,
            n50: nTinyDroplets,
            nKatu: nTinyDropletMisses
        }).calculate(attrs);

        return ppAttrs.pp;
    }

    if (attrs.mode === GameMode.Mania) {
        return null;
    }

    return null;
}

// TODO
export async function calculateBeatmap(id: number, score: osu.Score) {
    const beatmap = await fetchBeatmap(id).then(parseMap);

    if (score.ruleset_id !== osu.Ruleset.osu) {
        // two different types but they both use number gamemodes so force cast it.
        beatmap.convert(score.ruleset_id as unknown as GameMode);
    }

    const lazer = !score.legacy_score_id;

    // Difficulty Attributes (max combo, difficulty stars)
    const diffAttrs = new Difficulty({ mods: score.mods, lazer }).calculate(beatmap);

    // Maximum PP
    const maxAttrs = new Performance({ mods: score.mods, lazer }).calculate(diffAttrs);

    // Current PP
    // used in case the API does not return pp (failed plays, unranked maps)
    const currentAttrs = new Performance({
        mods: score.mods,
        lazer,
        misses: score.statistics.miss ?? 0,
        n300: score.statistics.great ?? 0,
        n100: score.statistics.ok ?? 0,
        n50: score.statistics.meh ?? 0,
        nGeki: score.statistics.perfect ?? 0,
        nKatu: score.statistics.good ?? 0,
        combo: score.max_combo
    }).calculate(maxAttrs);

    const maxCombo = diffAttrs.maxCombo;
    const stars = diffAttrs.stars;
    const maxPP = maxAttrs.pp;
    const currentPP = currentAttrs.pp;
    const fcPP = isFC(score, diffAttrs.maxCombo) ? calculateFC(beatmap, diffAttrs, score) : null;

    // Free up memory
    currentAttrs.free();
    maxAttrs.free();
    diffAttrs.free();
    beatmap.free();

    return { maxCombo, stars, maxPP, currentPP, fcPP };
}


export function formatGameMode(ruleset: osu.Ruleset) {
    switch (ruleset) {
        case osu.Ruleset.osu: return 'osu! Standard';
        case osu.Ruleset.mania: return 'osu!mania';
        case osu.Ruleset.fruits: return 'osu!catch';
        case osu.Ruleset.taiko: return 'osu!taiko';
    }
}
