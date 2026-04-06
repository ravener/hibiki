import { type CommandConfig } from '#lib/command';
import { formatDecimal } from '#lib/utils';
import { parseUserMention, type Message } from '@fluxerjs/core';

interface Gender {
    name: string;
    gender: string | null;
    probability: number;
    count: number;
}

export const config: CommandConfig = {
    description: 'Estimate someone\'s gender based on their name',
    extendedHelp: 'This command uses the Genderize API to predict the gender of a person based on their name.\nThis is only provided for entertainment purposes.',
    aliases: ['genderize']
};

export async function run(message: Message, args: string[]) {
    // parse mention -> if not mention, use as is -> if nothing provided use author
    const raw = args.join(' ');
    const targetId = parseUserMention(raw);
    const target = targetId ? await message.client.users.fetch(targetId).then(u => u.globalName ?? u.username) : (raw || (message.author.globalName ?? message.author.username));

    const response = await fetch(`https://api.genderize.io?name=${encodeURIComponent(target)}`);
    if (!response.ok) {
        if (response.status === 429) {
            await message.reply(`I have reached the API request limit for today, try again tomorrow!`);
            return;
        }

        throw new Error(`API returned ${response.status} ${response.statusText}`);
    }

    const { name, gender, probability } = await response.json() as Gender;
    if (!gender) {
        await message.reply('I could not determine the gender for that name!');
        return;
    }

    const percent = formatDecimal(probability * 100);
    await message.reply(`**${name}** is **${gender}** with **${percent}%** certainty`);
}
