// middleware/correlationId.js
const { v4: uuidv4 } = require('uuid');

const correlationIdMiddleware = (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    const requestId = uuidv4();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-req-id', requestId);
    next();
};

module.exports = correlationIdMiddleware;