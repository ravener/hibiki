import { type CommandConfig } from '#lib/command';
import { type Message } from '@fluxerjs/core';

export const config: CommandConfig = {
    description: 'Ask the magic 8ball a question.'
};

export async function run(message: Message, args: string[]) {
    const question = args.join(' ');
    if (!question) {
        await message.reply('You need to ask a question!');
    }

    const response = responses[~~(Math.random() * responses.length)]!;
    await message.reply(`**Question:** ${question}\n\n🎱 **${response}**`);
}

const responses = [
    'It is certain',
    'It is decidedly so',
    'without a doubt',
    'Yes definitely',
    'You may rely on it',
    'As I see it, Yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',
    'Reply hazy try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
    'Dont count on it',
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful'
];
