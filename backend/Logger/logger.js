const winston = require('winston');
const { combine, json, errors, prettyPrint, timestamp } = winston.format

const logger = winston.createLogger({
    
    transports: [
        new winston.transports.Console({
            format: combine(
                timestamp({format: 'DD-MM-YYYY HH:mm:ss A'}),
                errors({stack: true}),
                prettyPrint(),
                json()
            ),
        })
    ]
})

module.exports = logger;