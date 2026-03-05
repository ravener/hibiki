import type { EmbedBuilder, Message, ReactionCollector } from "@fluxerjs/core";

export interface PaginatorEmojis {
    firstPage?: string;
    previousPage?: string;
    stop?: string;
    nextPage?: string;
    lastPage?: string;
}

export interface PaginatorOptions {
    reply?: boolean;
    emojis?: PaginatorEmojis;
    timeout?: number;
}

const defaultEmojis: PaginatorEmojis = {
    firstPage: "⏮",
    previousPage: "◀",
    stop: "⏹",
    nextPage: "▶",
    lastPage: "⏭"
};

export class Paginator {
    private authorMessage: Message;
    private message?: Message;
    private options: Required<PaginatorOptions>;
    private pages: EmbedBuilder[];
    private page: number;
    private stopped: boolean;
    private collector?: ReactionCollector;

    constructor(message: Message, options?: PaginatorOptions) {
        this.authorMessage = message;
        this.options = {
            emojis: { ...options?.emojis, ...defaultEmojis },
            reply: true,
            timeout: 30_000, // 30 sec
            ...options
        };
        this.pages = [];
        this.page = 0; // index to pages
        this.stopped = false;
    }

    addPage(embed: EmbedBuilder) {
        this.pages.push(embed);
    }

    async firstPage() {
        await this.showPage(0);
        this.page = 0;
    }

    async previousPage() {
        if (this.page === 0) return;
        await this.showPage(--this.page);
    }

    async stop() {
        if (this.collector) {
            this.collector.stop("user");
            this.stopped = true;
        }
    }

    async nextPage() {
        if (this.page === this.pages.length - 1) return;
        await this.showPage(++this.page);
    }

    async lastPage() {
        const lastPage = this.pages.length - 1;
        if (this.page === lastPage) return;
        await this.showPage(lastPage);
        this.page = lastPage;
    }

    async showPage(page: number) {
        if (this.stopped) return;
        if (!this.message) {
            const embed = this.pages[page];
            if (!embed) return;

            if (this.options.reply) {
                this.message = await this.authorMessage.reply({ embeds: [embed] });
            } else {
                this.message = await this.authorMessage.send({ embeds: [embed] });
            }

            return;
        }

        const embed = this.pages[page];
        if (!embed) return;
        this.page = page;
        await this.message.edit({ embeds: [embed] });
    }

    async run() {
        if (!this.message) {
            await this.showPage(0);
            await this.addReactions();
        }

        this.collector = this.message!.createReactionCollector({
            filter: (reaction, user) => Object.values(this.options.emojis).includes(reaction.emojiIdentifier) && user.id === this.authorMessage.author.id,
            time: this.options.timeout
        });

        this.collector.on('collect', async (reaction, user) => {
            const emojis = this.options.emojis as Required<PaginatorEmojis>;
            await this.message!.removeReaction(reaction.emojiIdentifier, user.id);

            switch (reaction.emojiIdentifier) {
                case emojis.firstPage:
                    await this.firstPage();
                    break;
                case emojis.previousPage:
                    await this.previousPage();
                    break;
                case emojis.stop:
                    await this.stop();
                    break;
                case emojis.nextPage:
                    await this.nextPage();
                    break;
                case emojis.lastPage:
                    await this.lastPage();
                    break;
            }
        });

        this.collector.on('end', async (collected, reason) => {
            await this.message!.removeAllReactions();
        });
    }

    async addReactions() {
        if (!this.message) throw new Error('Message not sent.');

        for (const emoji of Object.values(this.options.emojis)) {
            await this.message.react(emoji);
        }
    }
}
