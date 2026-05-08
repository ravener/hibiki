import { type CommandConfig } from '#lib/command';
import { fetchImage } from '#lib/images';
import { parseMentionOrAuthor } from '#lib/utils';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Hold hands with someone',
    aliases: ['holdhands', 'handholding', 'holdhand']
};

export async function run(message: Message, args: string[]) {
    const target = await parseMentionOrAuthor(message, args[0]);
    const title = target === message.author
        ? `${message.author.username} holds their own hand`
        : `${message.author.username} holds hands with ${target.username}`;
    const embed = await fetchImage(target, 'handhold', title);
    await message.reply({ embeds: [embed] });
}
