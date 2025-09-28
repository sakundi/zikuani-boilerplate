const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "demo@sakundi.io";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";

const translations = {
    es: {
        htmlLang: 'es',
        language: {
            label: 'Idioma',
            options: { es: 'Español', en: 'Inglés' }
        },
        home: {
            title: 'Zikuani Login',
            heading: 'Pruebe su identidad de forma privada con Zikuani',
            emailLabel: 'Email:',
            methodLabel: 'Seleccione el método de autenticación:',
            passportOption: '🛂 Pasaporte',
            signatureOption: '🔐 Firma Digital',
            countryLabel: 'Seleccione el país de su pasaporte:',
            continueButton: 'Continuar'
        },
        passport: {
            title: 'Escanee el QR',
            heading: 'Escanee este código QR para autenticarse usando la aplicación rarime-app',
            appLink: 'Encuentre la aplicación aquí',
            confirmButton: 'Confirmar autenticación',
            confirmPending: '❌ Autenticación no confirmada aún',
            confirmErrorPrefix: '❌ Fallo al confirmar: '
        },
        callback: {
            title: 'Token Recibido',
            heading: '¡Usuario autenticado, bienvenido!',
            expiresLabel: 'Sesión expira en:',
            expiresSuffix: 'minutos',
            tokenLabel: 'Token:',
            proofLabel: 'Credencial verificable con prueba ZK:'
        },
        callbackError: {
            title: 'Error',
            heading: '¡Hubo un error obteniendo el token de autorización!'
        },
        errors: {
            invalidMethod: 'Método de autenticación no válido.',
            missingCode: 'Se requiere código de autenticación',
            authFetchFailed: 'No se pudo obtener respuesta del servidor de autenticación'
        }
    },
    en: {
        htmlLang: 'en',
        language: {
            label: 'Language',
            options: { es: 'Spanish', en: 'English' }
        },
        home: {
            title: 'Zikuani Login',
            heading: 'Verify your identity privately with Zikuani',
            emailLabel: 'Email:',
            methodLabel: 'Select the authentication method:',
            passportOption: '🛂 Passport',
            signatureOption: '🔐 Digital Signature',
            countryLabel: 'Select the country of your passport:',
            continueButton: 'Continue'
        },
        passport: {
            title: 'Scan the QR',
            heading: 'Scan this QR code to authenticate using the rarime app',
            appLink: 'Find the app here',
            confirmButton: 'Confirm authentication',
            confirmPending: '❌ Authentication not confirmed yet',
            confirmErrorPrefix: '❌ Failed to confirm: '
        },
        callback: {
            title: 'Token Received',
            heading: 'User authenticated, welcome!',
            expiresLabel: 'Session expires in:',
            expiresSuffix: 'minutes',
            tokenLabel: 'Token:',
            proofLabel: 'Verifiable credential with ZK proof:'
        },
        callbackError: {
            title: 'Error',
            heading: 'There was an error obtaining the authorization token!'
        },
        errors: {
            invalidMethod: 'Invalid authentication method.',
            missingCode: 'Authentication code is required',
            authFetchFailed: 'Failed to fetch from auth server'
        }
    }
};

const countries = [
    { value: 'CRI', emoji: '🇨🇷', labels: { es: 'Costa Rica (CRI)', en: 'Costa Rica (CRI)' } },
    { value: 'COL', emoji: '🇨🇴', labels: { es: 'Colombia (COL)', en: 'Colombia (COL)' } },
    { value: 'ZAF', emoji: '🇿🇦', labels: { es: 'Sudáfrica (ZAF)', en: 'South Africa (ZAF)' } },
    { value: 'USA', emoji: '🇺🇸', labels: { es: 'Estados Unidos (USA)', en: 'United States (USA)' } },
    { value: 'CAN', emoji: '🇨🇦', labels: { es: 'Canadá (CAN)', en: 'Canada (CAN)' } },
    { value: 'MEX', emoji: '🇲🇽', labels: { es: 'México (MEX)', en: 'Mexico (MEX)' } },
    { value: 'BRA', emoji: '🇧🇷', labels: { es: 'Brasil (BRA)', en: 'Brazil (BRA)' } },
    { value: 'ARG', emoji: '🇦🇷', labels: { es: 'Argentina (ARG)', en: 'Argentina (ARG)' } },
    { value: 'ESP', emoji: '🇪🇸', labels: { es: 'España (ESP)', en: 'Spain (ESP)' } },
    { value: 'FRA', emoji: '🇫🇷', labels: { es: 'Francia (FRA)', en: 'France (FRA)' } },
    { value: 'DEU', emoji: '🇩🇪', labels: { es: 'Alemania (DEU)', en: 'Germany (DEU)' } },
    { value: 'GBR', emoji: '🇬🇧', labels: { es: 'Reino Unido (GBR)', en: 'United Kingdom (GBR)' } },
    { value: 'ITA', emoji: '🇮🇹', labels: { es: 'Italia (ITA)', en: 'Italy (ITA)' } },
    { value: 'PRT', emoji: '🇵🇹', labels: { es: 'Portugal (PRT)', en: 'Portugal (PRT)' } },
    { value: 'AUS', emoji: '🇦🇺', labels: { es: 'Australia (AUS)', en: 'Australia (AUS)' } },
    { value: 'JPN', emoji: '🇯🇵', labels: { es: 'Japón (JPN)', en: 'Japan (JPN)' } },
    { value: 'CHN', emoji: '🇨🇳', labels: { es: 'China (CHN)', en: 'China (CHN)' } },
    { value: 'IND', emoji: '🇮🇳', labels: { es: 'India (IND)', en: 'India (IND)' } },
    { value: 'KOR', emoji: '🇰🇷', labels: { es: 'Corea del Sur (KOR)', en: 'South Korea (KOR)' } }
];

const supportedLanguages = Object.keys(translations);

function getLang(req) {
    const queryLang = (req.query.lang || '').toLowerCase();
    if (supportedLanguages.includes(queryLang)) {
        return queryLang;
    }

    const headerLang = req.headers['accept-language'];
    if (headerLang) {
        const preferred = headerLang
            .split(',')
            .map(item => item.trim().split(';')[0].toLowerCase())
            .find(code => supportedLanguages.includes(code.slice(0, 2)) && code.length >= 2);

        if (preferred) {
            const shortCode = preferred.slice(0, 2);
            if (supportedLanguages.includes(shortCode)) {
                return shortCode;
            }
        }
    }

    return 'es';
}

function createState(lang) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${lang}:${randomPart}`;
}

function getLanguageFromState(state) {
    if (!state || typeof state !== 'string') {
        return null;
    }

    const [maybeLang] = state.split(':');
    if (supportedLanguages.includes(maybeLang)) {
        return maybeLang;
    }

    return null;
}

function renderLanguageSwitcher(lang, texts, config = {}) {
    const { allowChange = true } = config;

    if (!allowChange) {
        const currentLabel = texts.language.options[lang] || lang.toUpperCase();
        return `
            <div class="text-end mb-3">
                <span class="form-label">${texts.language.label}: ${currentLabel}</span>
            </div>
        `;
    }

    const optionsMarkup = supportedLanguages
        .map(code => {
            const label = texts.language.options[code] || code.toUpperCase();
            const selected = code === lang ? ' selected' : '';
            return `<option value="${code}"${selected}>${label}</option>`;
        })
        .join('');

    return `
        <div class="text-end mb-3">
            <label for="lang-selector" class="form-label me-2">${texts.language.label}</label>
            <select id="lang-selector" class="form-select form-select-sm d-inline w-auto">${optionsMarkup}</select>
        </div>
        <script>
            (function() {
                var selector = document.getElementById('lang-selector');
                if (!selector) { return; }
                selector.addEventListener('change', function(event) {
                    var selectedLang = event.target.value;
                    var url = new URL(window.location.href);
                    url.searchParams.set('lang', selectedLang);
                    window.location.href = url.toString();
                });
            })();
        </script>
    `;
}

function escapeHtml(content) {
    return String(content)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderHomePage(lang, texts) {
    const countryOptions = countries
        .map(country => `<option value="${country.value}">${country.emoji} ${country.labels[lang] || country.labels.es}</option>`)
        .join('');

    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.home.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container py-5">
            ${renderLanguageSwitcher(lang, texts)}
            <h1 class="mb-4">${texts.home.heading}</h1>
            <form action="/login" method="get" class="p-4 rounded border bg-light">
                <input type="hidden" name="lang" value="${lang}">
                <div class="mb-3">
                    <label for="user" class="form-label">${texts.home.emailLabel}</label>
                    <input type="text" id="user" name="user" class="form-control">
                </div>
                <div class="mb-3">
                    <label for="method" class="form-label">${texts.home.methodLabel}</label>
                    <select id="method" name="method" class="form-select">
                        <option value="passport">${texts.home.passportOption}</option>
                        <option value="firma-digital">${texts.home.signatureOption}</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="country" class="form-label">${texts.home.countryLabel}</label>
                    <select id="country" name="country" class="form-select">
                        ${countryOptions}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">${texts.home.continueButton}</button>
            </form>
        </body>
        </html>
    `;
}

function renderPassportPage(lang, texts, { verificationLink, confirmUrl, checkUrl }) {
    const messages = {
        confirmPending: texts.passport.confirmPending,
        confirmErrorPrefix: texts.passport.confirmErrorPrefix
    };

    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.passport.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container py-5">
            ${renderLanguageSwitcher(lang, texts)}
            <h2 class="mb-4">${texts.passport.heading}</h2>
            <a href="https://docs.rarimo.com/rarime-app/" target="_blank">${texts.passport.appLink}</a>
            <div id="qrcode" class="mb-4 d-flex justify-content-center"></div>
            <div class="text-center">
                <button id="confirmButton" class="btn btn-success">${texts.passport.confirmButton}</button>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <script>
                (function() {
                    var authUrl = ${JSON.stringify(verificationLink)};
                    var messages = ${JSON.stringify(messages)};
                    var checkUrl = ${JSON.stringify(checkUrl)};
                    var confirmUrl = ${JSON.stringify(confirmUrl)};
                    new QRCode(document.getElementById('qrcode'), { text: authUrl, width: 256, height: 256 });
                    document.getElementById('confirmButton').addEventListener('click', function() {
                        fetch(checkUrl)
                            .then(function(response) {
                                if (!response.ok) { throw new Error(response.statusText || String(response.status)); }
                                return response.json();
                            })
                            .then(function(data) {
                                if (data.status === 'verified') {
                                    window.location.href = confirmUrl;
                                } else {
                                    alert(messages.confirmPending);
                                }
                            })
                            .catch(function(err) {
                                alert(messages.confirmErrorPrefix + err.message);
                            });
                    });
                })();
            </script>
        </body>
        </html>
    `;
}

function renderCallbackSuccessPage(lang, texts, { expiresIn, tokenPayload, proof }) {
    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.callback.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container py-5">
            ${renderLanguageSwitcher(lang, texts, { allowChange: false })}
            <h1 class="mb-4 text-success">${texts.callback.heading}</h1>
            <p><strong>${texts.callback.expiresLabel}</strong> ${expiresIn} ${texts.callback.expiresSuffix}</p>
            <div class="mb-3">
                <p class="mb-1"><strong>${texts.callback.tokenLabel}</strong></p>
                <pre class="bg-light p-3 rounded">${tokenPayload}</pre>
            </div>
            <div>
                <p class="mb-1"><strong>${texts.callback.proofLabel}</strong></p>
                <pre class="bg-light p-3 rounded">${proof}</pre>
            </div>
        </body>
        </html>
    `;
}

function renderCallbackErrorPage(lang, texts) {
    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.callbackError.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container py-5">
            ${renderLanguageSwitcher(lang, texts, { allowChange: false })}
            <h1 class="text-danger">${texts.callbackError.heading}</h1>
        </body>
        </html>
    `;
}

function parseJwt(token) {
    try {
        // Split the token into its parts (Header, Payload, Signature)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}

app.get('/', (req, res) => {
    const lang = getLang(req);
    const texts = translations[lang];
    res.send(renderHomePage(lang, texts));
});

app.get('/login', (req, res) => {
    const lang = getLang(req);
    const texts = translations[lang];
    const { method, user, country } = req.query;
    const state = createState(lang);

    if (method === 'firma-digital') {
        const authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify({
            grant_type: 'code',
            client_id: CLIENT_ID,
            user_id: user,
            redirect_uri: REDIRECT_URI,
            scope: 'zk-firma-digital',
            state,
            nullifier_seed: String(Math.floor(Math.random() * 10000))
        });
        return res.redirect(authUrl);
    }

    if (method === 'passport') {
        const queryParams = {
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
                        nationality: country,
                        nationality_check: true,
                        event_id: Math.floor(Math.random() * 100000)
                    }
                })
            )
        };

        const authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify(queryParams);

        return axios
            .get(authUrl, { headers: { Accept: 'application/json' } })
            .then((response) => {
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
                } else if (response.data && response.data.status === 'created') {
                    const confirmUrl = `${AUTH_SERVER_URL}/confirm-authorize?${querystring.stringify(queryParams)}`;
                    res.redirect(confirmUrl);
                } else {
                    res.status(500).json({ error: texts.errors.authFetchFailed });
                }
            })
            .catch((error) => {
                console.error('❌ Error:', error);
                res.status(500).json({ error: texts.errors.authFetchFailed });
            });
    }

    return res.status(400).send(texts.errors.invalidMethod);
});

app.get('/callback', async (req, res) => {
    const langFromState = getLanguageFromState(req.query.state);
    const fallbackLang = getLang(req);
    const lang = translations[langFromState] ? langFromState : fallbackLang;
    const texts = translations[lang] || translations.es;
    const { code, scope } = req.query;

    if (!code) {
        return res.status(400).send(texts.errors.missingCode);
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
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, expires_in, proof } = response.data;
        const tokenPayload = escapeHtml(JSON.stringify(parseJwt(access_token), null, 2));
        const proofPayload = escapeHtml(JSON.stringify(proof, null, 2));

        res.send(
            renderCallbackSuccessPage(lang, texts, {
                expiresIn: expires_in,
                tokenPayload,
                proof: proofPayload
            })
        );
    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        res.send(renderCallbackErrorPage(lang, texts));
    }
});

// Start the client server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Zikuani wallet client running on http://localhost:${PORT}/`);
});
