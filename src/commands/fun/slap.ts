import { type CommandConfig } from '#lib/command';
import { fetchImage } from '#lib/images';
import { parseMentionOrAuthor } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Slap someone'
};

export async function run(message: Message, args: string[]) {
    const target = await parseMentionOrAuthor(message, args[0]);
    const title = `${message.author.username} slaps ${target.id === message.author.id ? 'themselves' : target.username}`;
    const embed = await fetchImage(target, 'slap', title);

    await message.reply({ embeds: [embed] });
}
