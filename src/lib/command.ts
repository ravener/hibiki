import type { Message } from "@fluxerjs/core";

export interface CommandConfig {
    name?: string;
    aliases?: string[];
    description?: string;
    ownerOnly?: boolean;
    guildOnly?: boolean;
}

export type CommandRun = (message: Message, args: string[]) => Promise<void>;

export interface Command {
    config: CommandConfig;
    run: CommandRun;
}
