import { type CommandConfig } from '#lib/command';
import { commands } from '#lib/command-handler';
import { Colors, OwnerId } from '#lib/constants';
import { EmbedBuilder, type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'View bot commands',
    aliases: ['commands', 'cmds', 'info']
};

export async function run(message: Message, args: string[]) {
    const { user } = message.client;
    const embed = new EmbedBuilder()
        .setColor(Colors.Primary)
        .setAuthor({ name: user!.username, iconURL: user!.displayAvatarURL() })
        .setTitle('Hibiki - Commands');

    const categories: Record<string, string[]> = {};

    for (const command of commands.values()) {
        const { config } = command;
        if (!config.category) continue;
        const category = categories[config.category] ?? (categories[config.category] = []);
        category.push(config.name!);
    }

    if (message.author.id !== OwnerId) {
        delete categories['Owner'];
    }

    const lines = [];
    // Sort the categories alphabetically.
    const keys = Object.keys(categories).sort();
    for (const category of keys) {
        const commands = categories[category]!;
        lines.push(`**${category}**: ${commands.map(c => `\`${c}\``).join(', ')}`);
    }

    embed.setDescription(lines.join('\n'));
    await message.reply({ embeds: [embed] });
}
