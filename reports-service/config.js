require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT
    },
    database: {
        mongoUrl: process.env.MONGODB_URL,
        db_name: process.env.DB_NAME
    },
    observability: {
        jaeger_trace_url: process.env.JAEGER_TRACE_URI
    }
}

module.exports = config;