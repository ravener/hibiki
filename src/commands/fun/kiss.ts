import { type CommandConfig } from '#lib/command';
import { fetchImage } from '#lib/images';
import { parseMentionOrAuthor } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Kiss someone'
};

export async function run(message: Message, args: string[]) {
    const target = await parseMentionOrAuthor(message, args[0]);
    const title = `${message.author.username} kisses ${target.id === message.author.id ? 'themselves' : target.username}`;
    const embed = await fetchImage(target, 'kiss', title);

    await message.reply({ embeds: [embed] });
}
