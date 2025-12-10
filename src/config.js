function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const CLIENT_ID = requireEnv('CLIENT_ID');
const CLIENT_SECRET = requireEnv('CLIENT_SECRET');
const SESSION_SECRET = requireEnv('SESSION_SECRET');
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback';
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'https://app.sakundi.io';
const PORT = process.env.PORT || 3000;

const countries = [
    { value: 'COL', emoji: '🇨🇷', labels: { es: 'Costa Rica (CRI)' } }
];

module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    SESSION_SECRET,
    REDIRECT_URI,
    AUTH_SERVER_URL,
    PORT,
    countries
};
