import { Channels, Colors } from '#lib/constants';
import { EmbedBuilder, type Client } from '@fluxerjs/core';

export async function run(client: Client, error: Error) {
    console.error('An client error occurred:', error);

    const embed = new EmbedBuilder()
        .setTitle('Client Error')
        .setDescription(`\`\`\`${error.message}\`\`\``)
        .setColor(Colors.Primary);

    await client.channels.send(Channels.Errors, { embeds: [embed] }).catch(() => null);
}
