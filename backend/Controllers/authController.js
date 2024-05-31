const passport = require('passport');
const config = require('../config');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const { databaseResponseTimeHistogram, counter } = require('../Observability/metrics');

const failedRoute = (req, res) => {
    const logResult = {
        statusCode: res.statusCode,
    }
    logger.error('Failed to route the login credentials', logFormat(req, logResult))
    timer({operation: "User Google login failed route", success: "false"});
    counter.inc();
    res.status(401).json({
        success: false,
        message: "failure"
    })
}

const successRoute = (req, res) => {
    const timer = databaseResponseTimeHistogram.startTimer();

    if(req.user) {
        const logResult = {
            userId: req.user.userId,
            statusCode: res.statusCode,
        }
        logger.info('User logged via google account', logFormat(req, logResult))
        timer({operation: "User Google login success route", success: "true"});
        counter.inc();
        res.status(200).json({
            success: true,
            message: "successfull",
            user: req.user,
            corrId: req.headers['x-correlation-id']
            // cookie: req.cookies
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
    const timer = databaseResponseTimeHistogram.startTimer();

    const logResult = {
        statusCode: res.statusCode,
        responseTime: res.responseTime
    }
    logger.info('User logged out!', logFormat(req, logResult));
    timer({operation: "User Logout", success: "true"});
    counter.inc();
    req.logout(function(err) {
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