import { EmbedBuilder, type User } from '@fluxerjs/core';
import { Colors } from './constants.js';

interface Image {
    url: string;
    anime_name?: string;
    artist_name?: string;
}

interface Response {
    results: [Image]
}

// https://nekos.best/api/v2/endpoints
export type PicTypes = 'lurk' | 'shoot' | 'sleep' | 'clap'
    | 'shrug' | 'stare' | 'wave' | 'poke' | 'confused'
    | 'smile' | 'peck' | 'wink' | 'sip' | 'blush' | 'smug'
    | 'tickle' | 'yeet' | 'think' | 'highfive' | 'feed'
    | 'wag' | 'bite' | 'teehee' | 'shocked' | 'bleh'
    | 'bored' | 'nom' | 'nya' | 'yawn' | 'facepalm'
    | 'cuddle' | 'kick' | 'happy' | 'carry' | 'hug'
    | 'kabedon' | 'baka' | 'bonk' | 'pat' | 'angry'
    | 'spin' | 'shake' | 'run' | 'node' | 'nope'
    | 'kiss' | 'dance' | 'punch' | 'handshake'
    | 'slap' | 'cry' | 'lappillow' | 'pout'
    | 'blowkiss' | 'handhold' | 'salute'
    | 'thumbsup' | 'laugh' | 'tableflip'
    | 'neko' | 'waifu' | 'husbando'
    | 'kitsune';


export async function fetchImage(target: User, type: PicTypes, title: string) {
    const response = await fetch(`https://nekos.best/api/v2/${type}`);

    if (!response.ok) {
        throw new Error(`Nekos.best API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as Response;
    const image = data.results[0];

    return new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({ iconURL: target.displayAvatarURL(), name: title })
        .setImage(image.url)
        .setFooter({ text: `Source: ${image.anime_name ?? image.artist_name}` });
}
