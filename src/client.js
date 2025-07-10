const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";
const ACCOUNT = process.env.REACT_APP_USER_ID || "user@usermail.com";

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
  res.send(`
    <h1>Autentíquese usando su Wallet Zikuani</h1>
    <form action="/login" method="get">
      <label for="method">Seleccione el método de autenticación:</label><br><br>
      <select id="method" name="method">
        <option value="firma-digital">🔐 Firma Digital</option>
        <option value="passport">🛂 Pasaporte</option>
      </select><br><br>
      <button type="submit">Continuar</button>
    </form>
  `);
});

app.get('/login', (req, res) => {
    const { method } = req.query;
    let authUrl = "";

    if (method === 'firma-digital') {
        authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify({
            grant_type: "code",
            client_id: CLIENT_ID,
            user_id: ACCOUNT,
            redirect_uri: REDIRECT_URI,
            scope: "zk-firma-digital",
            // Convertir a string para evitar regeneración
            state: String(Math.floor(Math.random() * 10000)),
            nullifier_seed: 1000
        });
        // Redirect page with the parameters
        res.redirect(authUrl);
    } else if (method === 'passport') {
        const queryParams = {
            grant_type: "code",
            client_id: CLIENT_ID,
            user_id: ACCOUNT,
            redirect_uri: REDIRECT_URI,
            scope: "zk-passport",
            state: String(Math.floor(Math.random() * 10000)),
            nullifier_seed: 1000,
            data: encodeURIComponent(
                JSON.stringify({
                    "id": ACCOUNT,
                    "type": "user",
                    "attributes": {
                        "age_lower_bound": 18,
                        "uniqueness": true,
                        "nationality": "COL",
                        "nationality_check": true,
                        "event_id": Math.floor(Math.random() * 100000),
                    }
                })
            )
        };

        authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify(queryParams);

        try {
            // console.log(authUrl);
            axios.get(authUrl, {
                headers: { 'Accept': 'application/json' }
            }).then((response) => {
                // console.log(response);
                // ✅ Send the JSON response back to the browser
                if (response.data.link !== undefined && response.data.link !== null ) {
                    const verification_link = response.data.link;
                    // console.log(verification_link);
                    return res.send(`
                        <html>
                        <head>
                            <title>Scan QR Code</title>
                        </head>
                        <body>
                            <h1>Escanee este código QR para autenticarse</h1>
                            <div id="qrcode"></div>

                            <button id="confirmButton">Confirmar autenticación</button>

                            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                            <script>
                            const authUrl = ${JSON.stringify(verification_link)};
                            new QRCode(document.getElementById("qrcode"), {
                                text: authUrl,
                                width: 256,
                                height: 256
                            });

                            document.getElementById("confirmButton").addEventListener("click", () => {
                                fetch("${AUTH_SERVER_URL}/check-validated?user_id=${queryParams.user_id}&scope=zk-passport")
                                .then(response => {
                                    if (!response.ok) throw new Error("Error al confirmar");
                                    return response.json();
                                })
                                .then(data => {
                                    if (data.status === "verified") {
                                        alert("✅ Autenticación confirmada: " + JSON.stringify(data));
                                        const confirmUrl = "${AUTH_SERVER_URL}/confirm-authorize?${querystring.stringify(queryParams)}";
                                        window.location.href = confirmUrl;
                                    } else {
                                        alert("❌ Autenticación no confirmada aun");
                                    }
                                })
                                .catch(error => {
                                    alert("❌ Fallo al confirmar: " + error.message);
                                });
                            });
                            </script>
                        </body>
                        </html>
                    `);
                } else if (response.data.status !== undefined && response.data.status !== null &&
                    response.data.status === "created"
                ) {
                    const confirmUrl = `${AUTH_SERVER_URL}/confirm-authorize?` + querystring.stringify(queryParams);
                    res.redirect(confirmUrl);
                } else {
                    res.status(500).json({ error: "Failed to fetch from auth server" });
                }
            }).catch((error) => {
                console.error("❌ Error:", error);
                res.status(500).json({ error: "Failed to fetch from auth server" });
            });

        } catch (error) {
            console.error("❌ Error fetching JSON from auth server:", error.message);
            return res.status(500).json({ error: "Failed to fetch from auth server" });
        }

    } else {
        return res.status(400).send("Método de autenticación no válido.");
    }
});

app.get('/callback', async (req, res) => {
    // Step 2: Handle the callback from the OAuth server
    const { code, state, scope} = req.query;

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
            scope: scope,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, token_type, expires_in, proof } = response.data;

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
                <pre>${JSON.stringify(proof, null, 2)}</pre>
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
    console.log(`Zikuani wallet client running on http://localhost:${PORT}/`);
});
