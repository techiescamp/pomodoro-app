const logFormat = (req, res) => {
    return {
        host: req.headers.host,
        method: req.method,
        url: req.url,
        'x-corr-id': req.correlationId,
        userId: res.userId,
        emailId: res.emailId,
        statusCode: res.statusCode,
        ipAddress: req.ip,
    }
}

module.exports = logFormat;