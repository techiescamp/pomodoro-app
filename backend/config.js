require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT
    },
    database: {
        mongoUrl: process.env.MONGODB_URL
    },
    secrets: {
        jwt_key: process.env.JWT_SECRET
    },
    googleAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUrl: process.env.GOOGLE_REDIRECT_URI
    },
    session: {
        secret: process.env.SESSION_SECRET
    },
    urls: {
        baseUrl: process.env.BASE_URL,
        google_redirect_success: process.env.GOOGLE_REDIRECT_SUCCESS
    },
    mail: {
        email: process.env.ZOHO_MAIL,
        password: process.env.ZOHO_PASSWORD
    },
    observability: {
        jaeger_trace_url: process.env.JAEGER_TRACE_URI
    }
}

module.exports = config;