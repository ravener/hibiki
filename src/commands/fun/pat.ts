import { type CommandConfig } from '#lib/command';
import { fetchImage } from '#lib/images';
import { parseMentionOrAuthor } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Pat someone on the head'
};

export async function run(message: Message, args: string[]) {
    const target = await parseMentionOrAuthor(message, args[0]);
    const title = `${message.author.username} pats ${target.id === message.author.id ? 'themselves' : target.username} on the head`;
    const embed = await fetchImage(target, 'pat', title);

    await message.reply({ embeds: [embed] });
}
