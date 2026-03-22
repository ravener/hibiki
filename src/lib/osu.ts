import * as osu from 'osu-api-v2-js';
import { Beatmap, Difficulty, GameMode, Performance } from 'rosu-pp-js';
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

// TODO
export async function calculateBeatmap(id: number, score: osu.Score) {
    const beatmap = await fetchBeatmap(id).then(parseMap);
    const lazer = !score.legacy_score_id;
    const diffAttrs = new Difficulty({ mods: score.mods, lazer }).calculate(beatmap);
    const maxAttrs = new Performance({ mods: score.mods, lazer }).calculate(diffAttrs);
    const currentAttrs = new Performance({ mods: score.mods, lazer });

    beatmap.free();
    return {};
}

