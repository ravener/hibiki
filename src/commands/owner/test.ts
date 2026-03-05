import { type CommandConfig } from '#lib/command';
import { Colors } from '#lib/constants';
import { Paginator } from '#lib/paginator';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Test paginator'
};

export async function run(message: Message, args: string[]) {
    const pages = [
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 1').setDescription('Some content'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 2').setDescription('Some more content'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 3').setDescription('Lorem ipsum'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 4').setDescription('lmao'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 5').setDescription('stuff'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 6').setDescription('content'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 7').setDescription('even more'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 8').setDescription('hope this works'),
        new EmbedBuilder().setColor(Colors.Primary).setTitle('Page 9').setDescription('we did it'),
    ];

    const paginator = new Paginator(message);
    for (const page of pages) paginator.addPage(page);
    await paginator.run();
}
