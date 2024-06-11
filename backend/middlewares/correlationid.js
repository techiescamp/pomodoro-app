// middleware/correlationId.js
const { v4: uuidv4 } = require('uuid');

const correlationIdMiddleware = (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    const requestId = uuidv4();
    console.log(correlationId);
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('x-req-id', requestId);
    next();
};

module.exports = correlationIdMiddleware;