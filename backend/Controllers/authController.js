const passport = require('passport');
const config = require('../config');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const metrics = require('../Observability/metrics');
const { tracer } = require('../Observability/jaegerTrace');

const failedRoute = (req, res) => {
    const span = tracer.startSpan('google auth failed', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.errorCounter.inc();

    const logResult = {
        statusCode: res.statusCode,
    }
    span.addEvent('google auth failed');
    logger.error('Failed to route the login credentials', logFormat(req, logResult))
    span.end();
    return res.status(401).json({
        success: false,
        message: "failure"
    })
}

const successRoute = (req, res) => {
    const span = tracer.startSpan('google auth failed', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc();

    if(req.user) {
        const logResult = {
            userId: req.user.userId,
            statusCode: res.statusCode,
        }
        span.addEvent('User logged via google account');
        logger.info('User logged via google account', logFormat(req, logResult))
        span.end();
        return res.status(200).json({
            success: true,
            message: "successfull",
            user: req.user,
            corrId: req.headers['x-correlation-id']
        })
    }
}


// To initiate the Google OAuth2.0 authentication flow
const getGoogleAuth = (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
}

// callback URL for handling the OAuth2.0 response
const getGoogleCallback = (req, res, next) => {
    passport.authenticate('google', { 
      successRedirect: config.urls.baseUrl,
      failureRedirect: '/auth/login/failed' 
    })(req, res, next);
};


const googleLogout = (req, res) => {
    const span = tracer.startSpan('user logout', {
        attributes: { 'x-correlation-id': req.correlationId }
    });
    metrics.httpRequestCounter.inc();

    const logResult = {
        statusCode: res.statusCode,
        responseTime: res.responseTime
    }
    span.addEvent('User logged out!!')
    logger.info('User logged out!', logFormat(req, logResult));
    span.end();
    return req.logout(function(err) {
        if(err) return next(err)
        res.status(200).redirect(config.urls.baseUrl)
    })
}


module.exports = {
    failedRoute: failedRoute,
    successRoute: successRoute,
    getGoogleAuth: getGoogleAuth,
    getGoogleCallback: getGoogleCallback,
    googleLogout: googleLogout
}