import * as osu from 'osu-api-v2-js';

const CLIENT_ID = parseInt(process.env.OSU_CLIENT_ID!);
const CLIENT_SECRET = process.env.OSU_CLIENT_SECRET!;
const USER_AGENT = 'https://github.com/ravener/hibiki';
const TOKEN_URL = 'https://osu.ppy.sh/oauth/token';

export const api = new osu.API(CLIENT_ID, CLIENT_SECRET);

interface Token {
    expires_in: number;
    access_token: string;
}

let cachedToken: Token | null = null;

/**
 * Obtain an osu! API token via OAuth2 Credentials Grant
 */
async function fetchToken() {
    if (cachedToken && Date.now() < cachedToken.expires_in * 1000) {
        return cachedToken;
    }

    const headers = new Headers({
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
        client_id: CLIENT_ID.toString(),
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public'
    });

    const response = await fetch(TOKEN_URL, { headers, body });

    if (!response.ok) {
        const { statusText, status } = response;
        throw new Error(`Failed to obtain token: ${status} ${statusText}`);
    }

    const token = await response.json() as Token;
    cachedToken = token;
    return cachedToken;
}

async function request(endpoint: string) {
    const { access_token } = await fetchToken();

    const headers = new Headers({
        'User-Agent': USER_AGENT,
        'Authorization': `Bearer ${access_token}`
    });

    const response = await fetch(`https://osu.ppy.sh/api/v2${endpoint}`, { headers });
    return response;
}

async function getUser(username: string) {

}
