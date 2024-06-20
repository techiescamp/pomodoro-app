const logFormat = (req, res) => {
    return {
        host: req.headers.host,
        method: req.method,
        url: req.url,
        'x-corr-id': req.body.xCorrId,
        userId: res && res.userId,
        emailId: res && res.emailId,
        statusCode: res && res.statusCode,
        ipAddress: req.ip,
    }
}

module.exports = logFormat;