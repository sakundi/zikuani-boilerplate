const { supportedLanguages } = require('../translations');

function getLang(req) {
    return supportedLanguages[0];
}

function createState(lang) {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${lang}:${randomPart}`;
}

function getLanguageFromState(state) {
    return supportedLanguages[0];
}

module.exports = {
    getLang,
    createState,
    getLanguageFromState
};
