import * as osu from 'osu-api-v2-js';

const CLIENT_ID = parseInt(process.env.OSU_CLIENT_ID!);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET!;

export const api = new osu.API(CLIENT_ID, CLIENT_SECRET);
