import { type CommandConfig } from '#lib/command';
import { Colors } from '#lib/constants';
import { getDuration } from '#lib/utils';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Bot statistics',
    aliases: ['info', 'about']
};

const start = Date.now();

export async function run(message: Message, args: string[]) {
    const { client } = message;
    const users = client.users.size;
    const guilds = client.guilds.size;
    const memoryUsage = process.memoryUsage().heapTotal / 1024 / 1024;
    const uptime = Date.now() - start;

    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({ name: client.user!.username, iconURL: client.user!.displayAvatarURL() })
        .addFields(
            { name: 'Servers', value: guilds.toLocaleString(), inline: true },
            { name: 'Users', value: users.toLocaleString(), inline: true },
            { name: 'Memory Usage', value: `${memoryUsage.toFixed(2)} MB`, inline: true },
            { name: 'Uptime', value: getDuration(uptime), inline: true }
        );

    await message.reply({ embeds: [embed] });
}
