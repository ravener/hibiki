import type { Message } from "@fluxerjs/core";
import { api } from "./osu.js";
import { APIError } from "osu-api-v2-js";
import { users } from "./db.js";

/**
 * Quickly transform a url into a markdown link
 * @param name URL name
 * @param url URL
 * @returns Markdown
 */
export function link(name: string, url: string): string {
    return `[${name}](${url})`;
}

export function parseUser(mention: string) {
    const match = /<@!?(\d{17,})>/.exec(mention);
    if (!match) return null;
    return match[1];
}

export async function getOsuUser(message: Message, arg: string | undefined) {
    try {
        if (arg) {
            const match = parseUser(arg);
            if (match) {
                const config = await users.get(message.author.id);
                if (config && config.osuId) {
                    const user = await api.getUser(config.osuId);
                    return user;
                }
            }
            const id = parseInt(arg);
            const user = await api.getUser(!isNaN(id) ? id : arg);
            return user;
        }

        const config = await users.get(message.author.id);
        if (config && config.osuId) {
            const user = await api.getUser(config.osuId);
            return user;
        }

        await message.reply('You need to provide an osu! username or use the `link` command to save your osu! account.');
    } catch (err) {
        if (err instanceof APIError) {
            if (err.response?.status_code === 404) {
                await message.reply('Invalid osu! username, I could not find that user.');
                return;
            }
        }

        throw err;
    }
}
