import { type CommandConfig } from '#lib/command';
import { fetchImage } from '#lib/images';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Cry sadly :('
};

export async function run(message: Message, args: string[]) {
    const embed = await fetchImage(message.author, 'cry', `${message.author.username} is crying :(`);
    await message.reply({ embeds: [embed] });
}
