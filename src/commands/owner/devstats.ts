import { type CommandConfig } from '#lib/command';
import { Colors } from '#lib/constants';
import { beatmapCache } from '#lib/osu';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'View detailed developer only statistics.',
    ownerOnly: true,
    aliases: ['dstats']
};

export async function run(message: Message, args: string[]) {
    const meta = await beatmapCache.loadMeta();
    const totalFiles = Object.keys(meta).length;
    const totalSize = Object.values(meta).reduce((total, file) => total + file.size, 0);

    const cacheStats = [
        `**Cached Beatmaps:** ${totalFiles.toLocaleString()}`,
        `**Cache Size:** ${(totalSize / 1024 / 1024).toFixed(2)} MB`
    ].join('\n');

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setTitle('Developer Statistics')
        .addFields({ name: 'Beatmap Cache', value: cacheStats });

    await message.reply({ embeds: [embed] });
}
