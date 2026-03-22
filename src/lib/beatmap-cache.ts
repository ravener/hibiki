import { existsSync, mkdirSync } from 'node:fs';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type Meta = Record<string, { lastAccess: number; size: number }>;

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Beatmap cache used to cache beatmaps to prevent excessive API calls and to speed up access to beatmaps.
 */
export class BeatmapCache {
    path: string;
    metaFilePath: string;
    meta?: Meta;

    constructor(path: string) {
        this.path = path;
        this.metaFilePath = join(this.path, 'meta.json');

        if (!existsSync(this.path)) mkdirSync(this.path);
    }

    /**
     * Loads the Meta JSON file which contains information about the cache.
     * @returns The meta data JSON object
     */
    async loadMeta() {
        if (this.meta) return this.meta;

        if (existsSync(this.metaFilePath)) {
            const data = await readFile(this.metaFilePath, 'utf-8');
            this.meta = JSON.parse(data) as Meta;
            return this.meta;
        }

        this.meta = {};
        return this.meta;
    }

    async getBeatmap(id: number): Promise<string | null> {
        const filePath = join(this.path, `${id}.osu`);

        try {
            const data = await readFile(filePath, 'utf-8');
            const meta = await this.loadMeta();
            meta[id] = { lastAccess: Date.now(), size: data.length };
            await this.saveMeta();
            return data;
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                return null;
            }

            throw err;
        }
    }

    async saveMeta() {
        if (!this.meta) return;
        await writeFile(this.metaFilePath, JSON.stringify(this.meta), 'utf-8');
    }

    async saveBeatmap(id: number, data: string): Promise<void> {
        const filePath = join(this.path, `${id}.osu`);
        await writeFile(filePath, data, 'utf-8');
        const meta = await this.loadMeta();
        meta[id] = { lastAccess: Date.now(), size: data.length };
        await this.saveMeta();
    }

    /**
     * Cleans up the cache by removing beatmaps older than 7 days since last use
     * and ensures the cache stays below 100 MB
     */
    async cleanup() {
        const meta = await this.loadMeta();
        const now = Date.now();

        // 1. Remove expired (TTL)
        for (const [id, info] of Object.entries(meta)) {
            if (now - info.lastAccess > TTL) {
                await unlink(join(this.path, `${id}.osu`)).catch(() => {});
                delete meta[id];
            }
        }

        // 2. Enforce max size (LRU)
        let totalSize = Object.values(meta).reduce((sum, info) => sum + info.size, 0);

        if (totalSize > MAX_SIZE) {
            // sort by oldest first
            const sorted = Object.entries(meta).sort((a, b) => a[1].lastAccess - b[1].lastAccess);

            for (const [id, info] of sorted) {
                await unlink(join(this.path, `${id}.osu`)).catch(() => {});
                totalSize -= info.size;
                delete meta[id];
                if (totalSize <= MAX_SIZE) break;
            }
        }

        await this.saveMeta();
    }
}
