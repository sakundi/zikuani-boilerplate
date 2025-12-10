const translations = {
    es: {
        htmlLang: 'es',
        language: {
            label: 'Idioma',
            options: { es: 'Español' }
        },
        home: {
            title: 'Zikuani Login',
            heading: 'Pruebe su identidad de forma privada con Zikuani',
            subtitle: 'Confianza digital en segundos',
            description: 'Conéctese con sus credenciales verificables y proteja sus datos personales mediante pruebas de conocimiento cero.',
            emailLabel: 'Email:',
            emailPlaceholder: 'nombre@empresa.com',
            methodLabel: 'Método de autenticación:',
            methodHint: 'Autenticación con pasaporte biométrico.',
            passportOption: '🛂 Pasaporte',
            passportDescription: 'Verificación con pasaporte biométrico respaldado por Zikuani.',
            countryLabel: 'País del pasaporte:',
            countryHint: 'Solo se admite pasaporte de Costa Rica.',
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
        dashboard: {
            title: 'Sesión iniciada',
            heading: 'Autenticación completada',
            welcome: 'Tu prueba ZK ha sido validada y la sesión está activa.',
            userLabel: 'Usuario',
            expiresLabel: 'Sesión válida hasta',
            logoutButton: 'Cerrar sesión',
            backHome: 'Volver al inicio'
        },
        errors: {
            invalidMethod: 'Método de autenticación no válido.',
            missingCode: 'Se requiere código de autenticación',
            authFetchFailed: 'No se pudo obtener respuesta del servidor de autenticación'
        }
    }
};

const supportedLanguages = ['es'];

module.exports = {
    translations,
    supportedLanguages
};
