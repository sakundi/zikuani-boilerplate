function renderCallbackSuccessPage(lang, texts, { expiresIn, tokenPayload, tokenRaw, proofPayload, proofRaw }) {
    const homeUrl = '/';
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
                @media (max-width: 991.98px) {
                    .summary-card {
                        margin-bottom: 2.5rem;
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
    const homeUrl = '/';

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
                @media (max-width: 575.98px) {
                    .error-card {
                        padding: 2.25rem 1.75rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-shell container">
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

module.exports = {
    renderCallbackErrorPage,
    renderCallbackSuccessPage
};
