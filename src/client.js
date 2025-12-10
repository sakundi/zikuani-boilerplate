const express = require('express');
const session = require('express-session');

const { PORT, SESSION_SECRET } = require('./config');
const { registerRoutes } = require('./routes');

function createServer() {
    const app = express();
    const isProd = process.env.NODE_ENV === 'production';

    app.use(
        session({
            name: 'zk.sid',
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                sameSite: 'lax',
                secure: isProd,
                maxAge: 1000 * 60 * 60 * 24 * 2 // 48 hours
            }
        })
    );
    registerRoutes(app);
    return app;
}

function start() {
    const app = createServer();
    app.listen(PORT, () => {
        console.log(`Zikuani wallet client running on http://localhost:${PORT}/`);
    });
    return app;
}

if (require.main === module) {
    start();
}

module.exports = {
    createServer,
    start
};
