import { EmbedBuilder, type User } from '@fluxerjs/core';
import { Colors } from './constants.js';

interface Response {
    url: string;
}

// https://nekos.life/api/v2/endpoints
export type NekosLifeImg = 'ngif' | 'hug' | 'gecg' | 'pat' | 'cuddle' | 'meow' | 'tickle' | 'gasm' | 'goose' | 'lewd' | 'v3' | 'spank' | 'feed' | 'slap' | 'wallpaper' | 'neko' | 'lizard' | 'woof' | 'fox_girl' | '8ball' | 'kiss' | 'avatar' | 'waifu' | 'smug';
// https://waifu.pics/docs
export type WaifuPicsImg = 'waifu' | 'neko' | 'shinobu' | 'megumin' | 'bully' | 'cuddle' | 'cry' | 'hug' | 'awoo' | 'kiss' | 'lick' | 'pat' | 'smug' | 'bonk' | 'yeet' | 'blush' | 'smile' | 'wave' | 'highfive' | 'handhold' | 'nom' | 'bite' | 'glomp' | 'slap' | 'kill' | 'kick' | 'happy' | 'wink' | 'poke' | 'dance' | 'cringe';

export type PicTypes = Extract<NekosLifeImg, WaifuPicsImg>;

export async function nekosLife(type: NekosLifeImg) {
    const response = await fetch(`https://nekos.life/api/v2/img/${type}`);

    if (!response.ok) {
        throw new Error(`Nekos.life API Error: ${response.status} ${response.statusText}`);
    }

    const { url } = await response.json() as Response;
    return url;
}

export async function waifuAPI(type: WaifuPicsImg) {
    const response = await fetch(`https://api.waifu.pics/sfw/${type}`);

    if (!response.ok) {
        throw new Error(`Waifu.pics API Error: ${response.status} ${response.statusText}`);
    }

    const { url } = await response.json() as Response;
    return url;
}

/**
 * Use either of the APIs available for more diversity.
 * Only for image types that both APIs have in common.
 */
export function randomAPI(type: PicTypes) {
    const fns = [nekosLife, waifuAPI];
    const fn = fns[~~(Math.random() * fns.length)]!;

    return fn(type);
}

export function imageEmbed(target: User, url: string, title: string) {
    return new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({ iconURL: target.displayAvatarURL(), name: title })
        .setImage(url);
}
