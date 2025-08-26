const express = require('express');
const ethers = require('ethers');
const axios = require('axios');
const querystring = require('querystring');
const { Address, encodeAbiParameters,
        parseAbiParameters, toHex } = require("viem");

const app = express();

// Secrets
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "hello@example.com";
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || "password";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_SERVER_URL = process.env.REACT_APP_AUTH_SERVER_URL || "https://app.sakundi.io";

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

function buildVoteArguments(proof, vote) {
    // console.log(typeof proof);
    // console.log(proof);

    if (!proof.proof.piA.length || !proof.proof.piB.length || !proof.proof.piC.length) {
      throw new Error('Invalid proof structure')
    }

    const nullifier = BigInt(proof.pubSignals[0])
    const identityCreationTimestamp = BigInt(proof.pubSignals[15])
    const root = BigInt(proof.pubSignals[11])
    const currentDate = BigInt(proof.pubSignals[13])

    const a = [BigInt(proof.proof.piA[0]), BigInt(proof.proof.piA[1])]
    const b = [
      [BigInt(proof.proof.piB[0][1]), BigInt(proof.proof.piB[0][0])],
      [BigInt(proof.proof.piB[1][1]), BigInt(proof.proof.piB[1][0])],
    ]
    const c = [BigInt(proof.proof.piC[0]), BigInt(proof.proof.piC[1])]

    return {
      args: [
        toHex(root, { size: 32 }),
        currentDate,
        encodeAbiParameters(parseAbiParameters('uint256, (uint256, uint256)'), [
            vote,
            [nullifier, identityCreationTimestamp],
        ]),
        { a, b, c },
      ],
    }
}

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Zikuani Login</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container py-5">
            <h1 class="mb-4">Pruebe su identidad de forma privada con Zikuani</h1>
            <form action="/login" method="get" class="p-4 rounded border bg-light">
                <div class="mb-3">
                    <label for="fname">Usuario:</label><br>
                    <input type="text" id="user" name="user"><br>
                    <label for="method" class="form-label">Seleccione el método de autenticación:</label>
                    <select id="method" name="method" class="form-select">
                        <option value="firma-digital">🔐 Firma Digital</option>
                        <option value="passport">🛂 Pasaporte</option>
                    </select>
                </div>
                <div class="mb-3">
                <label for="country" class="form-label">Seleccione el país de su pasaporte:</label>
                <select id="country" name="country" class="form-select">
                    <option value="CRI">🇨🇷 Costa Rica (CRI)</option>
                    <option value="USA">🇺🇸 Estados Unidos (USA)</option>
                    <option value="ESP">🇪🇸 España (ESP)</option>
                    <option value="DEU">🇩🇪 Alemania (DEU)</option>
                    <option value="ARG">🇦🇷 Argentina (ARG)</option>
                    <option value="BRA">🇧🇷 Brasil (BRA)</option>
                    <option value="COL">🇨🇴 Colombia (COL)</option>
                    <option value="MEX">🇲🇽 México (MEX)</option>
                    <option value="PER">🇵🇪 Perú (PER)</option>
                    <option value="CHL">🇨🇱 Chile (CHL)</option>
                    <!-- Add more as needed -->
                </select>
                </div>
                <button type="submit" class="btn btn-primary">Continuar</button>
            </form>
        </body>
        </html>
    `);
});

app.get('/login', (req, res) => {
    const { method, user, country } = req.query;
    let authUrl = "";

    if (method === 'firma-digital') {
        authUrl = `${AUTH_SERVER_URL}/authorize?` + querystring.stringify({
            grant_type: "code",
            client_id: CLIENT_ID,
            user_id: user,
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
            user_id: user,
            redirect_uri: REDIRECT_URI,
            scope: "zk-passport",
            state: String(Math.floor(Math.random() * 10000)),
            nullifier_seed: 1000,
            data: encodeURIComponent(
                JSON.stringify({
                    "id": user,
                    "type": "user",
                    "attributes": {
                        "age_lower_bound": 18,
                        "uniqueness": true,
                        "nationality": country,
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
                    res.send(`
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <title>Escanee el QR</title>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                        </head>
                        <body class="container py-5">
                            <h2 class="mb-4">Escanee este código QR para autenticarse usando la aplicación rarime-app</h2>
                            <a href="https://docs.rarimo.com/rarime-app/" target="_blank">Encuentre la aplicación aquí</a>
                            <div id="qrcode" class="mb-4 d-flex justify-content-center"></div>
                            <div class="text-center">
                                <button id="confirmButton" class="btn btn-success">Confirmar autenticación</button>
                            </div>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                            <script>
                            const authUrl = ${JSON.stringify(verification_link)};
                            new QRCode(document.getElementById("qrcode"), { text: authUrl, width: 256, height: 256 });
                            document.getElementById("confirmButton").addEventListener("click", () => {
                                fetch("${AUTH_SERVER_URL}/check-validated?user_id=${queryParams.user_id}&scope=zk-passport")
                                .then(r => { if (!r.ok) throw new Error("Error al confirmar"); return r.json(); })
                                .then(data => { if (data.status === "verified") { const confirmUrl = "${AUTH_SERVER_URL}/confirm-authorize?${querystring.stringify(queryParams)}"; window.location.href = confirmUrl; } else { alert("❌ Autenticación no confirmada aún"); } })
                                .catch(err => alert("❌ Fallo al confirmar: " + err.message));
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
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Token Recibido</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="container py-5">
                <h1 class="mb-4 text-success">¡Usuario autenticado, bienvenido!</h1>
                <p><strong>Sesión expira en:</strong> ${expires_in} minutos</p>
                <div class="mb-3">
                    <p class="mb-1"><strong>Token:</strong></p>
                    <pre class="bg-light p-3 rounded">${JSON.stringify(parseJwt(access_token), null, 2)}</pre>
                </div>
                <div>
                    <p class="mb-1"><strong>Credencial verificable con prueba ZK:</strong></p>
                    <pre class="bg-light p-3 rounded">${buildVoteArguments(JSON.parse(proof), 1)}</pre>
                </div>
            </body>
            </html>
        `);

        // Use the access token for authenticated requests here if needed

    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Error</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="container py-5">
                <h1 class="text-danger">¡Hubo un error obteniendo el token de autorización!</h1>
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
