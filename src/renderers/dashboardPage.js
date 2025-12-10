function renderDashboardPage(lang, texts, { userId, expiresAt }) {
    const homeUrl = '/';
    const logoutUrl = '/logout';
    const expiresReadable = expiresAt ? new Date(expiresAt).toLocaleString(lang || 'es') : 'N/D';

    return `
        <!DOCTYPE html>
        <html lang="${texts.htmlLang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${texts.dashboard.title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600&display=swap" rel="stylesheet">
            <style>
                body {
                    min-height: 100vh;
                    margin: 0;
                    background: radial-gradient(140% 180% at 82% 18%, rgba(86, 110, 255, 0.42) 0%, rgba(14, 26, 70, 0.9) 45%, #040716 100%);
                    color: #f4f7ff;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    align-items: stretch;
                }
                .page-shell {
                    width: 100%;
                    padding: 3rem 1rem;
                }
                .card-shell {
                    background: rgba(8, 15, 46, 0.9);
                    border: 1px solid rgba(122, 155, 255, 0.35);
                    border-radius: 22px;
                    padding: 2.5rem 2rem;
                    box-shadow: 0 26px 68px rgba(6, 14, 45, 0.55);
                    backdrop-filter: blur(12px);
                }
                .title {
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 600;
                    font-size: clamp(2rem, 1.6vw + 1.2rem, 2.5rem);
                    margin-bottom: 0.5rem;
                }
                .subtitle {
                    color: rgba(228, 235, 255, 0.82);
                    margin-bottom: 1.5rem;
                    font-size: 1.05rem;
                }
                .pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 1rem;
                    background: rgba(18, 32, 84, 0.9);
                    border: 1px solid rgba(133, 168, 255, 0.45);
                    border-radius: 999px;
                    font-weight: 600;
                    color: #f7f9ff;
                    margin-right: 0.5rem;
                }
                .btn-row {
                    margin-top: 1.5rem;
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }
                .btn-primary {
                    background: linear-gradient(130deg, #5b74ff 0%, #2f9aff 100%);
                    border: none;
                    border-radius: 14px;
                    padding: 0.8rem 1.1rem;
                    font-weight: 600;
                    box-shadow: 0 18px 36px rgba(47, 134, 255, 0.45);
                }
                .btn-outline-light {
                    border-radius: 14px;
                    font-weight: 600;
                    padding: 0.8rem 1.1rem;
                    border-width: 1px;
                }
            </style>
        </head>
        <body>
            <div class="page-shell container">
                <div class="row justify-content-center">
                    <div class="col-lg-10 col-xl-8">
                        <div class="card-shell">
                            <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
                                <div>
                                    <h1 class="title">${texts.dashboard.heading}</h1>
                                    <p class="subtitle">${texts.dashboard.welcome}</p>
                                </div>
                                <div class="pill">${texts.dashboard.userLabel}: ${userId || 'N/D'}</div>
                            </div>
                            <div class="pill">${texts.dashboard.expiresLabel}: ${expiresReadable}</div>
                            <div class="btn-row">
                                <a class="btn btn-primary" href="${logoutUrl}">${texts.dashboard.logoutButton}</a>
                                <a class="btn btn-outline-light" href="${homeUrl}">${texts.dashboard.backHome}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = {
    renderDashboardPage
};
