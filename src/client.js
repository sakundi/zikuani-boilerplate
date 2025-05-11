const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";
const ACCOUNT = process.env.ACCOUNT || "user@usermail.com";

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

app.get('/login', (req, res) => {
    // Step 1: Redirect user to the OAuth server for authorization
    const authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify({
        grant_type: "code",
        client_id: CLIENT_ID,
        user_id: ACCOUNT,
        redirect_uri: REDIRECT_URI,
        scope: "zk-firma-digital",        state: String(Math.floor(Math.random() * 10000)), // Convertir a string para evitar regeneración
        nullifier_seed: 1000
    });
    res.send(`
        <h1>Autentíquese usando su Wallet Zikuani</h1>
        <p><a href="${authUrl}">Haga click en el enlance para comenzar el proceso de autenticación</a></p>
    `);
});

app.get('/callback', async (req, res) => {
    // Step 2: Handle the callback from the OAuth server
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send('Se requiere código de autenticación');
    }

    try {
        // Step 3: Exchange the authorization code for an access token
        const response = await axios.post(`${AUTH_SERVER_URL}/token`, querystring.stringify({
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, token_type, expires_in, verifiable_credential } = response.data;

        // Display the access token
        res.send(`
            <html>
            <head>
                <title>Token Recibido</title>
                <style>
                body { font-family: sans-serif; padding: 2em; line-height: 1.5; }
                h1 { color: #2c3e50; }
                pre { background: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h1>¡Token de acceso recibido!</h1>
                <p><strong>Tipo de Token:</strong> ${token_type}</p>
                <p><strong>Expira en:</strong> ${expires_in} minutos</p>
                <p><strong>Token:</strong></p>
                <pre>${JSON.stringify(parseJwt(access_token), null, 2)}</pre>
                <p><strong>Credencial verificable con prueba ZK:</strong></p>
                <pre>${JSON.stringify(verifiable_credential, null, 2)}</pre>
            </body>
            </html>
        `);

        // Use the access token for authenticated requests here if needed

    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        res.send(`
            <html>
            <head>
                <title>Error</title>
                <style>
                body { font-family: sans-serif; padding: 2em; line-height: 1.5; }
                h1 { color: #2c3e50; }
                pre { background: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h1>¡Hubo un error obteniendo el token de autorización!</h1>
            </body>
            </html>
        `);
    }
});

// Start the client server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Zikuani wallet client running on http://localhost:${PORT}/login`);
});
