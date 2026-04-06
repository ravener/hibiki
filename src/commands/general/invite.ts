import { type CommandConfig } from '#lib/command';
import { Colors, Links } from '#lib/constants';
import { link } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Invite the bot to your community',
    aliases: ['inv']
};

export async function run(message: Message, args: string[]) {
    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle('Invite Misaki')
        .setDescription([
            'You can invite me to your community using the following link:',
            '',
            `• :link: ${link('Invite Link', Links.Invite)}`,
            `• :inbox_tray: ${link('Join Support Community', Links.Community)}`,
            `• :star: ${link('Star on GitHub', Links.GitHub)}`,
            `• :thumbsup: ${link('Upvote on FluxerList', Links.FluxerList)}`
        ].join('\n'));

    await message.reply({ embeds: [embed] });
}
