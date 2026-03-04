import type { Message } from "@fluxerjs/core";

export interface CommandConfig {
    name?: string;
    aliases?: string[];
    description?: string;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    category?: string;
}

export type CommandRun = (message: Message, args: string[], ctx: CommandContext) => Promise<void>;

export interface CommandContext {
    /**
     * The arguments passed to this command.
     */
    args: string[];

    /**
     * The alias that was used to invoke this command.
     */
    alias: string;
}

export interface Command {
    config: CommandConfig;
    run: CommandRun;
}
