import type { Client } from '@fluxerjs/core';

export async function run(client: Client) {
    console.log(`Ready! Logged in as ${client.user!.username}`);
}
