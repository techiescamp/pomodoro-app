const winston = require('winston');
const { combine, json, errors, prettyPrint, timestamp } = winston.format

const logger = winston.createLogger({
    format: combine(
        timestamp({format: 'DD-MM-YYYY HH:mm:ss A'}),
        errors({stack: true}),
        json(),
        prettyPrint(),
    ),
    transports: [
        new winston.transports.Console()
    ]
})

module.exports = logger;