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
            subtitle: 'Confianza digital en segundos',
            description: 'Conéctese con sus credenciales verificables y proteja sus datos personales mediante pruebas de conocimiento cero.',
            emailLabel: 'Email:',
            emailPlaceholder: 'nombre@empresa.com',
            methodLabel: 'Seleccione el método de autenticación:',
            methodHint: 'Elija cómo desea validar su identidad.',
            passportOption: '🛂 Pasaporte',
            passportDescription: 'Verificación con pasaporte biométrico respaldado por Zikuani.',
            signatureOption: '🔐 Firma Digital',
            signatureDescription: 'Use su Firma Digital con protección de conocimiento cero.',
            countryLabel: 'Seleccione el país de su pasaporte:',
            countryHint: 'Seleccione el país que emitió su pasaporte.',
            continueButton: 'Continuar'
        },
        passport: {
            title: 'Escanee el QR',
            subtitle: 'Confirme desde su dispositivo móvil',
            heading: 'Escanee este código QR para autenticarse usando la aplicación rarime-app',
            qrHelp: 'Abra la cámara de su teléfono, escanee el código y complete el proceso en la aplicación.',
            appLink: 'Encuentre la aplicación aquí',
            confirmButton: 'Confirmar autenticación',
            checkingStatus: 'Verificando autenticación...',
            confirmPending: '❌ Autenticación no confirmada aún',
            confirmErrorPrefix: '❌ Fallo al confirmar: '
        },
        callback: {
            title: 'Token Recibido',
            heading: '¡Usuario autenticado, bienvenido!',
            successSubtitle: 'Su identidad se validó correctamente con Zikuani.',
            expiresLabel: 'Sesión expira en:',
            expiresSuffix: 'minutos',
            tokenLabel: 'Token:',
            proofLabel: 'Credencial verificable con prueba ZK:',
            detailsTitle: 'Detalles de la sesión',
            backButton: 'Volver al inicio',
            copyAction: 'Copiar JSON',
            copied: '¡Copiado!',
            copyError: 'No se pudo copiar',
            noProof: 'Sin prueba disponible'
        },
        callbackError: {
            title: 'Error',
            heading: '¡Hubo un error obteniendo el token de autorización!',
            description: 'Revise el enlace de autenticación e intente nuevamente.'
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
            subtitle: 'Digital trust in seconds',
            description: 'Connect with verifiable credentials and protect your personal data using zero-knowledge proofs.',
            emailLabel: 'Email:',
            emailPlaceholder: 'name@company.com',
            methodLabel: 'Select the authentication method:',
            methodHint: 'Choose how you want to verify your identity.',
            passportOption: '🛂 Passport',
            passportDescription: 'Passport verification backed by Zikuani biometrics.',
            signatureOption: '🔐 Firma Digital',
            signatureDescription: 'Complete a Firma Digital flow with zero-knowledge privacy.',
            countryLabel: 'Select the country of your passport:',
            countryHint: 'Pick the country that issued your passport.',
            continueButton: 'Continue'
        },
        passport: {
            title: 'Scan the QR',
            subtitle: 'Confirm from your mobile device',
            heading: 'Scan this QR code to authenticate using the rarime app',
            qrHelp: 'Open your phone camera, scan the code, and finish the flow in the app.',
            appLink: 'Find the app here',
            confirmButton: 'Confirm authentication',
            checkingStatus: 'Checking authentication status...',
            confirmPending: '❌ Authentication not confirmed yet',
            confirmErrorPrefix: '❌ Failed to confirm: '
        },
        callback: {
            title: 'Token Received',
            heading: 'User authenticated, welcome!',
            successSubtitle: 'Your identity was successfully confirmed with Zikuani.',
            expiresLabel: 'Session expires in:',
            expiresSuffix: 'minutes',
            tokenLabel: 'Token:',
            proofLabel: 'Verifiable credential with ZK proof:',
            detailsTitle: 'Session details',
            backButton: 'Return to start',
            copyAction: 'Copy JSON',
            copied: 'Copied!',
            copyError: 'Could not copy',
            noProof: 'No proof available'
        },
        callbackError: {
            title: 'Error',
            heading: 'There was an error obtaining the authorization token!',
            description: 'Check the authentication link and try again.'
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
            <div class="language-switcher text-end mb-3">
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
        <div class="language-switcher text-end mb-3">
            <label for="lang-selector" class="form-label me-2">${texts.language.label}</label>
            <select id="lang-selector" class="form-select form-select-sm d-inline w-auto language-select">${optionsMarkup}</select>
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
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --zikuani-primary: #5a6dff;
                    --zikuani-accent: #2f9bff;
                    --zikuani-deep: #091133;
                }
                body {
                    min-height: 100vh;
                    margin: 0;
                    background: radial-gradient(140% 180% at 12% 12%, rgba(20, 48, 132, 0.75) 0%, rgba(9, 25, 74, 0.9) 40%, #040921 82%);
                    background-color: #040921;
                    color: #f1f4ff;
                    font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    align-items: stretch;
                }
                .page-shell {
                    width: 100%;
                    position: relative;
                    padding-top: 4rem;
                    padding-bottom: 4rem;
                }
                .hero {
                    max-width: 32rem;
                }
                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.45rem 0.85rem;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.82);
                    font-size: 0.8rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                .hero {
                    color: #f7f9ff;
                }
                .hero-title {
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    font-size: clamp(2.2rem, 2.8vw + 1.2rem, 3.4rem);
                    color: #ffffff;
                }
                .hero-subtitle {
                    font-size: 1.15rem;
                    font-weight: 500;
                    color: rgba(203, 215, 255, 0.95);
                    margin-bottom: 0.8rem;
                }
                .hero-description {
                    color: rgba(224, 232, 255, 0.82);
                    font-size: 1rem;
                    line-height: 1.65;
                }
                .glass-card {
                    background: rgba(6, 12, 38, 0.88);
                    border: 1px solid rgba(110, 138, 255, 0.4);
                    border-radius: 22px;
                    backdrop-filter: blur(18px);
                    color: #f6f8ff;
                    box-shadow: 0 24px 60px rgba(13, 26, 63, 0.45);
                }
                .glass-card .form-label {
                    font-weight: 600;
                    color: rgba(247, 249, 255, 0.95);
                    margin-bottom: 0.5rem;
                }
                .glass-card .form-control,
                .glass-card .form-select {
                    background: rgba(255, 255, 255, 0.95);
                    border: none;
                    border-radius: 14px;
                    padding: 0.75rem 1rem;
                    color: var(--zikuani-deep);
                    font-weight: 500;
                    box-shadow: 0 8px 18px rgba(13, 26, 63, 0.12);
                }
                .glass-card .form-control:focus,
                .glass-card .form-select:focus {
                    box-shadow: 0 0 0 0.2rem rgba(90, 109, 255, 0.25);
                }
                .glass-card .form-control::placeholder {
                    color: rgba(22, 36, 78, 0.45);
                    font-weight: 400;
                }
                .glass-card .form-select {
                    padding-right: 2.5rem;
                }
                .form-text.method-hint {
                    color: rgba(223, 229, 255, 0.78);
                }
                .helper-text {
                    font-size: 0.85rem;
                    color: rgba(214, 223, 255, 0.72);
                    margin-top: 0.35rem;
                }
                .method-grid {
                    display: grid;
                    gap: 1rem;
                }
                .method-option {
                    position: relative;
                }
                .method-radio {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }
                .method-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1.1rem 1.25rem;
                    border-radius: 18px;
                    border: 1px solid rgba(101, 131, 255, 0.35);
                    background: rgba(7, 15, 46, 0.82);
                    transition: transform 0.25s ease, border 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
                    cursor: pointer;
                }
                .method-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(149, 188, 255, 0.75);
                    box-shadow: 0 18px 40px rgba(14, 27, 68, 0.55);
                }
                .method-radio:checked + .method-card {
                    border-color: rgba(179, 214, 255, 0.95);
                    background: rgba(58, 109, 255, 0.32);
                    box-shadow: 0 20px 44px rgba(60, 114, 255, 0.6);
                }
                .method-emoji {
                    font-size: 2rem;
                    line-height: 1;
                }
                .method-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #ffffff;
                }
                .method-description {
                    margin: 0.35rem 0 0;
                    color: rgba(225, 234, 255, 0.78);
                    font-size: 0.95rem;
                }
                .btn-primary {
                    background: linear-gradient(135deg, var(--zikuani-primary) 0%, var(--zikuani-accent) 100%);
                    border: none;
                    border-radius: 16px;
                    padding: 0.85rem 1.5rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    box-shadow: 0 16px 36px rgba(47, 134, 255, 0.45);
                    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
                }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 22px 44px rgba(47, 134, 255, 0.55);
                    filter: brightness(1.05);
                }
                .language-switcher .form-label {
                    color: rgba(229, 236, 255, 0.8);
                    font-weight: 500;
                }
                .language-switcher .language-select {
                    background: rgba(11, 18, 54, 0.85);
                    border: 1px solid rgba(114, 141, 255, 0.45);
                    color: #f3f6ff;
                    border-radius: 12px;
                    padding-right: 2rem;
                }
                .language-switcher .language-select:focus {
                    box-shadow: 0 0 0 0.2rem rgba(90, 109, 255, 0.25);
                }
                .language-switcher .language-select option {
                    color: #101a40;
                }
                @media (max-width: 991.98px) {
                    .hero {
                        text-align: center;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .hero-description {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .language-switcher {
                        text-align: left !important;
                        margin-bottom: 2rem;
                    }
                }
                @media (max-width: 767.98px) {
                    body {
                        padding: 2.5rem 0;
                    }
                    .page-shell {
                        padding-top: 2rem;
                    }
                    .glass-card {
                        padding: 2rem !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-shell container">
                ${renderLanguageSwitcher(lang, texts)}
                <div class="row align-items-center justify-content-between g-5">
                    <div class="col-lg-6">
                        <div class="hero">
                            <span class="hero-badge">Zikuani</span>
                            <h1 class="hero-title">${texts.home.heading}</h1>
                            <p class="hero-subtitle">${texts.home.subtitle}</p>
                            <p class="hero-description">${texts.home.description}</p>
                        </div>
                    </div>
                    <div class="col-lg-5 ms-lg-auto">
                        <form action="/login" method="get" class="glass-card p-4 p-lg-5">
                            <input type="hidden" name="lang" value="${lang}">
                            <div class="mb-4">
                                <label for="user" class="form-label">${texts.home.emailLabel}</label>
                                <input type="email" id="user" name="user" class="form-control form-control-lg" placeholder="${texts.home.emailPlaceholder}" required>
                            </div>
                            <div class="mb-4">
                                <span class="form-label d-block">${texts.home.methodLabel}</span>
                                <p class="form-text method-hint mb-3">${texts.home.methodHint}</p>
                                <div class="method-grid">
                                    <div class="method-option">
                                        <input type="radio" class="method-radio" name="method" id="method-passport" value="passport" checked>
                                        <label class="method-card" for="method-passport">
                                            <span class="method-emoji">🛂</span>
                                            <span>
                                                <span class="method-title">${texts.home.passportOption.replace('🛂', '').trim()}</span>
                                                <p class="method-description">${texts.home.passportDescription}</p>
                                            </span>
                                        </label>
                                    </div>
                                    <div class="method-option">
                                        <input type="radio" class="method-radio" name="method" id="method-signature" value="firma-digital">
                                        <label class="method-card" for="method-signature">
                                            <span class="method-emoji">🔐</span>
                                            <span>
                                                <span class="method-title">${texts.home.signatureOption.replace('🔐', '').trim()}</span>
                                                <p class="method-description">${texts.home.signatureDescription}</p>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label for="country" class="form-label">${texts.home.countryLabel}</label>
                                <select id="country" name="country" class="form-select form-select-lg" required>
                                    <option value="" disabled selected hidden>${texts.home.countryHint}</option>
                                    ${countryOptions}
                                </select>
                                <p class="helper-text">${texts.home.countryHint}</p>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">${texts.home.continueButton}</button>
                        </form>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function renderPassportPage(lang, texts, { verificationLink, confirmUrl, checkUrl }) {
    const messages = {
        confirmPending: texts.passport.confirmPending,
        confirmErrorPrefix: texts.passport.confirmErrorPrefix,
        checkingStatus: texts.passport.checkingStatus
    };

    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.passport.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    min-height: 100vh;
                    margin: 0;
                    background: radial-gradient(150% 190% at 85% 12%, rgba(32, 83, 210, 0.55) 0%, rgba(16, 31, 92, 0.88) 40%, #03081c 90%);
                    background-color: #03081c;
                    color: #e8ecff;
                    font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    align-items: stretch;
                }
                .page-shell {
                    width: 100%;
                    padding-top: 3rem;
                    padding-bottom: 3rem;
                }
                .hero-title {
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-size: clamp(2rem, 2.5vw + 1rem, 3rem);
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 1rem;
                }
                .hero-subtitle {
                    color: #b9c6ff;
                    font-size: 1.1rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                .hero-description {
                    color: rgba(219, 226, 255, 0.82);
                    line-height: 1.65;
                    margin-bottom: 1.75rem;
                }
                .app-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #8ecbff;
                    font-weight: 600;
                    text-decoration: none;
                    padding-bottom: 0.15rem;
                    border-bottom: 1px solid rgba(142, 203, 255, 0.45);
                }
                .app-link:hover {
                    color: #a9dcff;
                    border-bottom-color: rgba(169, 220, 255, 0.65);
                }
                .glass-card {
                    background: rgba(6, 14, 39, 0.88);
                    border: 1px solid rgba(112, 143, 255, 0.38);
                    border-radius: 22px;
                    backdrop-filter: blur(18px);
                    color: #eaf0ff;
                    box-shadow: 0 24px 60px rgba(6, 15, 45, 0.5);
                }
                .glass-card .qr-wrapper {
                    display: inline-flex;
                    padding: 1.25rem;
                    border-radius: 20px;
                    background: rgba(5, 12, 35, 0.65);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: inset 0 8px 16px rgba(3, 8, 24, 0.45);
                }
                #qrcode {
                    width: 256px;
                    height: 256px;
                }
                .qr-help {
                    margin-top: 1.5rem;
                    color: rgba(214, 223, 255, 0.78);
                }
                .status-banner {
                    margin-top: 1.25rem;
                    border-radius: 16px;
                    padding: 0.85rem 1rem;
                    font-weight: 500;
                    display: none;
                }
                .status-banner.active {
                    display: block;
                }
                .status-banner[data-variant="info"] {
                    background: rgba(84, 108, 255, 0.24);
                    border: 1px solid rgba(120, 150, 255, 0.45);
                    color: #e3e8ff;
                }
                .status-banner[data-variant="warning"] {
                    background: rgba(255, 193, 7, 0.22);
                    border: 1px solid rgba(255, 193, 7, 0.4);
                    color: #ffe9b8;
                }
                .status-banner[data-variant="error"] {
                    background: rgba(255, 99, 132, 0.24);
                    border: 1px solid rgba(255, 125, 150, 0.45);
                    color: #ffdce4;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #5a6dff 0%, #2f9bff 100%);
                    border: none;
                    border-radius: 16px;
                    padding: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 16px 38px rgba(47, 134, 255, 0.45);
                    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
                }
                .btn-primary:enabled:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 22px 44px rgba(47, 134, 255, 0.55);
                    filter: brightness(1.05);
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: progress;
                    box-shadow: none;
                }
                .language-switcher .form-label {
                    color: rgba(226, 232, 255, 0.82);
                }
                .language-switcher .language-select {
                    background: rgba(9, 18, 52, 0.88);
                    border: 1px solid rgba(110, 141, 255, 0.4);
                    color: #f6f8ff;
                    border-radius: 12px;
                }
                .language-switcher .language-select option {
                    color: #0d1737;
                }
                @media (max-width: 991.98px) {
                    .hero-title, .hero-subtitle, .hero-description {
                        text-align: center;
                    }
                    .app-link {
                        justify-content: center;
                    }
                    .language-switcher {
                        text-align: left !important;
                        margin-bottom: 2rem;
                    }
                }
                @media (max-width: 767.98px) {
                    body {
                        padding: 2.5rem 0;
                    }
                    .glass-card {
                        padding: 2rem !important;
                    }
                    .glass-card .qr-wrapper {
                        padding: 1rem;
                    }
                    #qrcode {
                        width: 220px;
                        height: 220px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-shell container">
                ${renderLanguageSwitcher(lang, texts)}
                <div class="row align-items-center justify-content-between g-5">
                    <div class="col-lg-6">
                        <div class="hero">
                            <h1 class="hero-title">${texts.passport.title}</h1>
                            <p class="hero-subtitle">${texts.passport.subtitle}</p>
                            <p class="hero-description">${texts.passport.heading}</p>
                            <a href="https://docs.rarimo.com/rarime-app/" class="app-link" target="_blank" rel="noopener">${texts.passport.appLink}</a>
                        </div>
                    </div>
                    <div class="col-lg-5 ms-lg-auto">
                        <div class="glass-card p-4 p-lg-5 text-center">
                            <div class="qr-wrapper mx-auto">
                                <div id="qrcode"></div>
                            </div>
                            <p class="qr-help">${texts.passport.qrHelp}</p>
                            <div id="statusMessage" class="status-banner" data-variant="info"></div>
                            <button id="confirmButton" class="btn btn-primary w-100 mt-4">${texts.passport.confirmButton}</button>
                        </div>
                    </div>
                </div>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <script>
                (function() {
                    var authUrl = ${JSON.stringify(verificationLink)};
                    var messages = ${JSON.stringify(messages)};
                    var checkUrl = ${JSON.stringify(checkUrl)};
                    var confirmUrl = ${JSON.stringify(confirmUrl)};
                    var status = document.getElementById('statusMessage');
                    var confirmButton = document.getElementById('confirmButton');
                    new QRCode(document.getElementById('qrcode'), { text: authUrl, width: 256, height: 256 });
                    function setStatus(message, variant) {
                        if (!status) { return; }
                        status.textContent = message;
                        status.setAttribute('data-variant', variant || 'info');
                        status.classList.add('active');
                    }
                    confirmButton.addEventListener('click', function() {
                        confirmButton.disabled = true;
                        setStatus(messages.checkingStatus, 'info');
                        fetch(checkUrl)
                            .then(function(response) {
                                if (!response.ok) { throw new Error(response.statusText || String(response.status)); }
                                return response.json();
                            })
                            .then(function(data) {
                                if (data.status === 'verified') {
                                    window.location.href = confirmUrl;
                                } else {
                                    setStatus(messages.confirmPending, 'warning');
                                }
                            })
                            .catch(function(err) {
                                setStatus(messages.confirmErrorPrefix + err.message, 'error');
                            })
                            .finally(function() {
                                confirmButton.disabled = false;
                            });
                    });
                })();
            </script>
        </body>
        </html>
    `;
}

function renderCallbackSuccessPage(lang, texts, { expiresIn, tokenPayload, tokenRaw, proofPayload, proofRaw }) {
    const homeUrl = `/?lang=${encodeURIComponent(lang)}`;
    const copyPayloads = {
        token: tokenRaw || '',
        proof: proofRaw || ''
    };

    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.callback.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    min-height: 100vh;
                    margin: 0;
                    background: radial-gradient(110% 150% at 85% 10%, rgba(74, 128, 255, 0.35) 0%, rgba(13, 26, 63, 0.88) 40%, #020617 100%);
                    color: #f2f4ff;
                    font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                }
                .page-shell {
                    width: 100%;
                    padding-top: 3.5rem;
                    padding-bottom: 3.5rem;
                }
                .summary-card {
                    background: linear-gradient(155deg, rgba(54, 87, 255, 0.95) 0%, rgba(26, 112, 255, 0.85) 55%, rgba(39, 96, 255, 0.85) 100%);
                    border-radius: 26px;
                    padding: 2.5rem 2rem;
                    border: 1px solid rgba(152, 186, 255, 0.45);
                    backdrop-filter: blur(18px);
                    box-shadow: 0 26px 65px rgba(9, 22, 65, 0.48);
                }
                .success-icon {
                    width: 72px;
                    height: 72px;
                    border-radius: 24px;
                    background: rgba(255, 255, 255, 0.18);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.4rem;
                    color: #0b122f;
                    box-shadow: inset 0 8px 16px rgba(255, 255, 255, 0.18), 0 12px 24px rgba(14, 20, 56, 0.28);
                    margin-bottom: 1.75rem;
                }
                .summary-title {
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: clamp(2rem, 1.5vw + 1.5rem, 2.6rem);
                    color: #ffffff;
                    margin-bottom: 0.75rem;
                }
                .summary-subtitle {
                    font-size: 1.05rem;
                    color: rgba(245, 249, 255, 0.92);
                    line-height: 1.65;
                    margin-bottom: 2rem;
                }
                .session-chip {
                    display: inline-flex;
                    align-items: baseline;
                    gap: 0.35rem;
                    padding: 0.65rem 1rem;
                    background: rgba(4, 18, 60, 0.55);
                    border: 1px solid rgba(174, 203, 255, 0.5);
                    border-radius: 999px;
                    font-weight: 600;
                    color: #f8faff;
                    letter-spacing: 0.02em;
                }
                .session-chip .chip-value {
                    font-size: 1.65rem;
                }
                .details-card {
                    background: rgba(7, 15, 44, 0.88);
                    border: 1px solid rgba(116, 147, 255, 0.42);
                    border-radius: 24px;
                    backdrop-filter: blur(22px);
                    color: #f0f3ff;
                    box-shadow: 0 26px 70px rgba(6, 15, 45, 0.55);
                }
                .details-title {
                    font-size: 1.35rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }
                .data-section + .data-section {
                    margin-top: 1.75rem;
                }
                .data-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                }
                .data-label {
                    font-weight: 600;
                    color: #f6f8ff;
                }
                .copy-btn {
                    padding: 0.45rem 0.9rem;
                    border-radius: 12px;
                    border: 1px solid rgba(130, 158, 255, 0.45);
                    background: rgba(7, 16, 46, 0.78);
                    color: #e1e8ff;
                    font-weight: 600;
                    font-size: 0.85rem;
                    letter-spacing: 0.01em;
                    transition: all 0.22s ease;
                }
                .copy-btn:hover {
                    color: #ffffff;
                    border-color: rgba(177, 206, 255, 0.65);
                    transform: translateY(-1px);
                }
                .copy-btn.copied {
                    background: rgba(46, 204, 113, 0.32);
                    border-color: rgba(102, 230, 168, 0.55);
                    color: #d4ffe7;
                }
                .copy-btn.error {
                    background: rgba(255, 99, 132, 0.3);
                    border-color: rgba(255, 141, 166, 0.5);
                    color: #ffe1e8;
                }
                .data-pre {
                    background: rgba(4, 12, 38, 0.94);
                    border-radius: 18px;
                    border: 1px solid rgba(115, 141, 255, 0.28);
                    padding: 1.25rem;
                    max-height: 280px;
                    overflow: auto;
                    font-family: 'IBM Plex Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                    font-size: 0.88rem;
                    line-height: 1.58;
                    color: #d2dcff;
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .data-pre::-webkit-scrollbar {
                    width: 8px;
                }
                .data-pre::-webkit-scrollbar-track {
                    background: transparent;
                }
                .data-pre::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.28);
                    border-radius: 12px;
                }
                .btn-outline-light {
                    border-radius: 16px;
                    font-weight: 600;
                    padding: 0.85rem 1.2rem;
                    border-width: 1px;
                    transition: all 0.22s ease;
                }
                .btn-outline-light:hover {
                    background: rgba(255, 255, 255, 0.18);
                    border-color: rgba(255, 255, 255, 0.4);
                    color: #ffffff;
                }
                .language-switcher .form-label {
                    color: rgba(233, 237, 255, 0.78);
                }
                @media (max-width: 991.98px) {
                    .summary-card {
                        margin-bottom: 2.5rem;
                    }
                    .language-switcher {
                        text-align: left !important;
                        margin-bottom: 2rem;
                    }
                }
                @media (max-width: 767.98px) {
                    body {
                        padding: 2.5rem 0;
                    }
                    .page-shell {
                        padding-top: 2rem;
                    }
                    .summary-card, .details-card {
                        padding: 2rem 1.5rem !important;
                    }
                    .data-pre {
                        max-height: 220px;
                        font-size: 0.82rem;
                    }
                    .data-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .copy-btn {
                        width: 100%;
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-shell container">
                ${renderLanguageSwitcher(lang, texts, { allowChange: false })}
                <div class="row align-items-stretch g-4">
                    <div class="col-lg-5">
                        <div class="summary-card h-100">
                            <div class="success-icon">✓</div>
                            <h1 class="summary-title">${texts.callback.heading}</h1>
                            <p class="summary-subtitle">${texts.callback.successSubtitle}</p>
                            <div class="session-chip">
                                <span class="chip-label">${texts.callback.expiresLabel}</span>
                                <span class="chip-value">${expiresIn}</span>
                                <span class="chip-suffix">${texts.callback.expiresSuffix}</span>
                            </div>
                            <a href="${homeUrl}" class="btn btn-outline-light w-100 mt-4">${texts.callback.backButton}</a>
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <div class="details-card h-100 p-4 p-lg-5">
                            <h2 class="details-title">${texts.callback.detailsTitle}</h2>
                            <div class="data-section">
                                <div class="data-header">
                                    <span class="data-label">${texts.callback.tokenLabel}</span>
                                    <button type="button" class="copy-btn" data-copy="token">${texts.callback.copyAction}</button>
                                </div>
                                <pre class="data-pre" id="tokenPayload">${tokenPayload}</pre>
                            </div>
                            <div class="data-section">
                                <div class="data-header">
                                    <span class="data-label">${texts.callback.proofLabel}</span>
                                    <button type="button" class="copy-btn" data-copy="proof">${texts.callback.copyAction}</button>
                                </div>
                                <pre class="data-pre" id="proofPayload">${proofPayload}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <script>
                (function() {
                    var copyPayloads = ${JSON.stringify(copyPayloads)};
                    var copyMessages = ${JSON.stringify({
                        action: texts.callback.copyAction,
                        copied: texts.callback.copied,
                        error: texts.callback.copyError
                    })};
                    var buttons = document.querySelectorAll('.copy-btn');

                    function copyToClipboard(value) {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            return navigator.clipboard.writeText(value);
                        }
                        return new Promise(function(resolve, reject) {
                            var textarea = document.createElement('textarea');
                            textarea.value = value;
                            textarea.setAttribute('readonly', '');
                            textarea.style.position = 'absolute';
                            textarea.style.left = '-9999px';
                            document.body.appendChild(textarea);
                            textarea.select();
                            try {
                                var succeeded = document.execCommand('copy');
                                document.body.removeChild(textarea);
                                if (succeeded) { resolve(); } else { reject(); }
                            } catch (err) {
                                document.body.removeChild(textarea);
                                reject(err);
                            }
                        });
                    }

                    function setButtonState(button, state) {
                        if (!button) { return; }
                        if (button.__copyTimer) {
                            clearTimeout(button.__copyTimer);
                        }
                        button.classList.remove('copied', 'error');
                        if (state === 'copied') {
                            button.classList.add('copied');
                            button.textContent = copyMessages.copied;
                        } else if (state === 'error') {
                            button.classList.add('error');
                            button.textContent = copyMessages.error;
                        } else {
                            button.textContent = copyMessages.action;
                        }
                        button.__copyTimer = setTimeout(function() {
                            button.classList.remove('copied', 'error');
                            button.textContent = copyMessages.action;
                        }, state === 'ready' ? 0 : 2200);
                    }

                    buttons.forEach(function(button) {
                        button.textContent = copyMessages.action;
                        button.addEventListener('click', function() {
                            var key = button.getAttribute('data-copy');
                            var value = copyPayloads[key];
                            if (typeof value !== 'string' || !value) {
                                setButtonState(button, 'error');
                                return;
                            }
                            copyToClipboard(value)
                                .then(function() {
                                    setButtonState(button, 'copied');
                                })
                                .catch(function() {
                                    setButtonState(button, 'error');
                                });
                        });
                    });
                })();
            </script>
        </body>
        </html>
    `;
}

function renderCallbackErrorPage(lang, texts) {
    const homeUrl = `/?lang=${encodeURIComponent(lang)}`;

    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.callbackError.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    min-height: 100vh;
                    margin: 0;
                    background: radial-gradient(120% 180% at 18% 12%, rgba(147, 31, 69, 0.45) 0%, rgba(62, 17, 46, 0.92) 48%, #090213 100%);
                    background-color: #090213;
                    color: #ffeef3;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                }
                .page-shell {
                    width: 100%;
                    padding: 4rem 1rem;
                }
                .error-card {
                    max-width: 520px;
                    margin: 0 auto;
                    background: rgba(28, 6, 26, 0.9);
                    border-radius: 28px;
                    border: 1px solid rgba(255, 150, 178, 0.35);
                    backdrop-filter: blur(20px);
                    padding: 3rem 2.5rem;
                    text-align: center;
                    box-shadow: 0 30px 76px rgba(25, 2, 30, 0.62);
                }
                .error-icon {
                    width: 72px;
                    height: 72px;
                    margin: 0 auto 1.5rem;
                    border-radius: 24px;
                    background: rgba(255, 77, 109, 0.22);
                    border: 1px solid rgba(255, 134, 154, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.3rem;
                    color: #ffd6de;
                    box-shadow: inset 0 10px 16px rgba(255, 77, 109, 0.35);
                }
                .error-title {
                    font-weight: 600;
                    font-size: clamp(1.8rem, 1.4vw + 1.2rem, 2.4rem);
                    margin-bottom: 1rem;
                    color: #fff4f7;
                }
                .error-description {
                    color: rgba(255, 235, 243, 0.8);
                    line-height: 1.6;
                    margin-bottom: 2.5rem;
                    font-size: 1.05rem;
                }
                .btn-outline-light {
                    border-radius: 16px;
                    font-weight: 600;
                    padding: 0.8rem 1.25rem;
                    border-width: 1px;
                    transition: all 0.22s ease;
                }
                .btn-outline-light:hover {
                    background: rgba(255, 255, 255, 0.16);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.4);
                }
                .language-switcher .form-label {
                    color: rgba(255, 236, 243, 0.75);
                }
                .language-switcher {
                    max-width: 520px;
                    margin: 0 auto 2rem;
                }
                @media (max-width: 575.98px) {
                    .error-card {
                        padding: 2.25rem 1.75rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-shell container">
                ${renderLanguageSwitcher(lang, texts, { allowChange: false })}
                <div class="error-card">
                    <div class="error-icon">!</div>
                    <h1 class="error-title">${texts.callbackError.heading}</h1>
                    <p class="error-description">${texts.callbackError.description}</p>
                    <a href="${homeUrl}" class="btn btn-outline-light w-100">${texts.callback.backButton}</a>
                </div>
            </div>
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
        const decodedToken = parseJwt(access_token);
        const tokenReadable = decodedToken
            ? JSON.stringify(decodedToken, null, 2)
            : (access_token ? String(access_token) : '');
        const proofReadable = proof ? JSON.stringify(proof, null, 2) : texts.callback.noProof;
        const tokenPayload = escapeHtml(tokenReadable);
        const proofPayload = escapeHtml(proofReadable);

        res.send(
            renderCallbackSuccessPage(lang, texts, {
                expiresIn: expires_in,
                tokenPayload,
                tokenRaw: tokenReadable,
                proofPayload,
                proofRaw: proofReadable
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
