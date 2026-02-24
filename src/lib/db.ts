import KeyvSqlite from '@keyv/sqlite';
import Keyv from 'keyv';

export interface UserConfig {
    osuId?: number;
}

export interface GuildConfig {
    prefix?: string;
}

const users = new Keyv<UserConfig>(new KeyvSqlite('sqlite://database.sqlite'), { namespace: 'users' });
const guilds = new Keyv<GuildConfig>(new KeyvSqlite('sqlite://database.sqlite'), { namespace: 'guilds' });

export async function getPrefix(guildId: string) {
    const config = await guilds.get(guildId);
    return config?.prefix
}

export { users, guilds };
