import type { Message } from "@fluxerjs/core";
import { api } from "./osu.js";
import { APIError } from "osu-api-v2-js";
import { users } from "./db.js";

/**
 * Converts a string to proper case.
 * Proper case capitalizes the first letter of each word and converts the rest to lowercase.
 * @param str - The string to convert.
 * @returns The string in proper case.
 */
export function toProperCase(str: string): string {
    return str.replace(
        /([^\W_]+[^\s-]*) */g,
        (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
}


/**
 * Quickly transform a url into a markdown link
 * @param name URL name
 * @param url URL
 * @returns Markdown
 */
export function link(name: string, url: string): string {
    return `[${name}](${url})`;
}

async function getLinkedUser(userId: string) {
    const config = await users.get(userId);
    if (config?.osuId) {
        return api.getUser(config.osuId);
    }
    return null;
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
                const user = await getLinkedUser(match);
                if (user) return user;
                await message.reply(`That user does not have an osu! account linked.`);
                return;
            }

            const id = parseInt(arg);
            const user = await api.getUser(!isNaN(id) ? id : arg);
            return user;
        }

        const user = await getLinkedUser(message.author.id);
        if (user) return user;

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

/**
 * Convert milliseconds into human readable duration string.
 */
export function getDuration(time: number): string {
    if (time < 1000) return `${time} ms`;

    const seconds = Math.floor(time / 1000) % 60;
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const days = Math.floor((time / (1000 * 60 * 60 * 24)) % 7);

    return [
        `${days} day${days > 1 ? 's' : ''}`,
        `${hours} hour${hours > 1 ? 's' : ''}`,
        `${minutes} minute${minutes > 1 ? 's' : ''}`,
        `${seconds} second${seconds > 1 ? 's' : ''}`
    ]
        .filter((time) => !time.startsWith('0'))
        .join(', ');
}
