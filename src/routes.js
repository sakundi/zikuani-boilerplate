const axios = require('axios');
const querystring = require('querystring');

const { AUTH_SERVER_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = require('./config');
const { renderHomePage } = require('./renderers/homePage');
const { renderPassportPage } = require('./renderers/passportPage');
const { renderCallbackErrorPage } = require('./renderers/callbackPage');
const { renderDashboardPage } = require('./renderers/dashboardPage');
const { translations } = require('./translations');
const { createState, getLang, getLanguageFromState } = require('./utils/language');
const { parseJwt } = require('./utils/token');

function handleHome(req, res) {
    const lang = getLang(req);
    const texts = translations[lang];
    res.send(renderHomePage(lang, texts));
}

function buildPassportQuery({ user, country, state }) {
    const nationality = country || 'CRI';
    return {
        grant_type: 'code',
        client_id: CLIENT_ID,
        user_id: user,
        redirect_uri: REDIRECT_URI,
        scope: 'zk-passport',
        state,
        nullifier_seed: String(Math.floor(Math.random() * 10000)),
        data: encodeURIComponent(
            JSON.stringify({
                id: user,
                type: 'user',
                attributes: {
                    age_lower_bound: 18,
                    uniqueness: true,
                    nationality,
                    nationality_check: true,
                    event_id: Math.floor(Math.random() * 100000)
                }
            })
        )
    };
}

async function handlePassportLogin(req, res, { lang, texts, user, country, state }) {
    const queryParams = buildPassportQuery({ user, country, state });
    const authUrl = `${AUTH_SERVER_URL}/authorize?${querystring.stringify(queryParams)}`;

    try {
        const response = await axios.get(authUrl, { headers: { Accept: 'application/json' } });

        if (response.data && response.data.link) {
            const verificationLink = response.data.link;
            const encodedUserId = encodeURIComponent(user || '');
            const checkUrl = `${AUTH_SERVER_URL}/check-validated?user_id=${encodedUserId}&scope=zk-passport`;
            const confirmUrl = `${AUTH_SERVER_URL}/confirm-authorize?${querystring.stringify(queryParams)}`;
            res.send(
                renderPassportPage(lang, texts, {
                    verificationLink,
                    confirmUrl,
                    checkUrl
                })
            );
            return;
        }

        if (response.data && response.data.status === 'created') {
            const confirmUrl = `${AUTH_SERVER_URL}/confirm-authorize?${querystring.stringify(queryParams)}`;
            res.redirect(confirmUrl);
            return;
        }

        res.status(500).json({ error: texts.errors.authFetchFailed });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: texts.errors.authFetchFailed });
    }
}

function handleLogin(req, res) {
    if (req.session?.user) {
        res.redirect('/dashboard');
        return;
    }
    const lang = getLang(req);
    const texts = translations[lang];
    const { user, country } = req.query;
    const state = createState(lang);

    handlePassportLogin(req, res, { lang, texts, user, country, state });
}

function storeSession(req, data) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((regenErr) => {
            if (regenErr) {
                return reject(regenErr);
            }
            req.session.user = data;
            resolve();
        });
    });
}

function destroySession(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function requireAuth(req, res, next) {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
        res.redirect('/');
        return;
    }
    const now = Date.now();
    if (sessionUser.expiresAt && now > sessionUser.expiresAt) {
        destroySession(req).finally(() => res.redirect('/'));
        return;
    }
    next();
}

async function handleCallback(req, res) {
    const langFromState = getLanguageFromState(req.query.state);
    const fallbackLang = getLang(req);
    const lang = translations[langFromState] ? langFromState : fallbackLang;
    const texts = translations[lang] || translations.es;
    const { code, scope } = req.query;

    if (!code) {
        res.status(400).send(texts.errors.missingCode);
        return;
    }

    try {
        const response = await axios.post(
            `${AUTH_SERVER_URL}/token`,
            querystring.stringify({
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                scope,
                grant_type: 'authorization_code'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, expires_in, proof } = response.data;
        if (!proof || !access_token) {
            throw new Error('Missing proof or access token');
        }

        const decodedToken = parseJwt(access_token);
        const expiresAt = Date.now() + (Number(expires_in) || 0) * 1000;
        const userId =
            (decodedToken && decodedToken.sub) ||
            (decodedToken && decodedToken.user_id) ||
            (decodedToken && decodedToken.id) ||
            'user';

        await storeSession(req, { userId, expiresAt });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        res.send(renderCallbackErrorPage(lang, texts));
    }
}

async function handleDashboard(req, res) {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
        res.redirect('/');
        return;
    }
    const lang = getLang(req);
    const texts = translations[lang];
    res.send(
        renderDashboardPage(lang, texts, {
            userId: sessionUser.userId,
            expiresAt: sessionUser.expiresAt
        })
    );
}

async function handleLogout(req, res) {
    await destroySession(req).catch((err) => console.error('Error destroying session', err));
    res.redirect('/');
}

function registerRoutes(app) {
    app.get('/', handleHome);
    app.get('/login', handleLogin);
    app.get('/callback', handleCallback);
    app.get('/dashboard', requireAuth, handleDashboard);
    app.get('/logout', handleLogout);
}

module.exports = {
    registerRoutes
};
