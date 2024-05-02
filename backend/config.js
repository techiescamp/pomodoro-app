require('dotenv').config();


const config = {
    server: {
        port: process.env.PORT
    },
    database: {
        mongoUrl: process.env.MONGODB_URL
    },
}


module.exports = config;