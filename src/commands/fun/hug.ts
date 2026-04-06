import { type CommandConfig } from '#lib/command';
import { imageEmbed, randomAPI } from '#lib/images';
import { parseMentionOrAuthor } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Hug someone'
};

export async function run(message: Message, args: string[]) {
    const target = await parseMentionOrAuthor(message, args[0]);
    const url = await randomAPI('hug');
    const title = `${message.author.username} hugs ${target.id === message.author.id ? 'themselves' : target.username}`;
    const embed = imageEmbed(target, url, title);

    await message.reply({ embeds: [embed] });
}
