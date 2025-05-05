const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";
const ACCOUNT = process.env.ACCOUNT || "0x86E67a05324A55AF6B2b3bF1A5cBA1778C56A8bE";

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
    // Step 1: Redirect user to the OAuth server for authorization
    const authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify({
        grant_type: "code",
        client_id: CLIENT_ID,
        user_id: ACCOUNT,
        redirect_uri: REDIRECT_URI,
        scope: "zk-firma-digital",
        state: String(Math.floor(Math.random() * 10000)), // Convertir a string para evitar regeneración
        nullifier_seed: voteScope
    });
    res.send(`
        <h1>Autentíquese con su Firma Digital</h1>
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

        const { access_token, token_type, expires_in } = response.data;

        // Display the access token
        res.send(`
            <h1>Token de acceso recibido!</h1>
            <p>Token: ${JSON.stringify(parseJwt(access_token))}</p>
            <p>Tipo de Token: ${token_type}</p>
            <p>Expira en: ${expires_in} minutos</p>
        `);

        // Use the access token for authenticated requests here if needed

    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        res.status(500).send('Failed to exchange authorization code for access token');
    }
});

// Start the client server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`OAuth client running on http://localhost:${PORT}`);
});
