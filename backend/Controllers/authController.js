const passport = require('passport');
const config = require('../config');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');

const failedRoute = (req, res) => {
    const logResult = {
        statusCode: res.statusCode,
    }
    logger.error('Failed to route the login credentials', logFormat(req, logResult))
    
    res.status(401).json({
        success: false,
        message: "failure"
    })
}

const successRoute = (req, res) => {
    if(req.user) {
        const logResult = {
            userId: req.user.userId,
            statusCode: res.statusCode,
        }
        logger.info('yay user logged!!!', logFormat(req, logResult))
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
const getGoogleAuth = (req, res) => {
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
}

// callback URL for handling the OAuth2.0 response
const getGoogleCallback = (req, res) => {
    passport.authenticate('google', {
        successRedirect: config.urls.baseUrl,
        failureRedirect: '/auth/login/failed'
    })
}

const googleLogout = (req, res) => {
    const logResult = {
        statusCode: res.statusCode,
        responseTime: res.responseTime
    }
    logger.info('oops logged out', logFormat(req, logResult));

    req.logout(function(err) {
        if(err) return next(err)
        res.redirect(config.urls.baseUrl)
    })
}


module.exports = {
    failedRoute: failedRoute,
    successRoute: successRoute,
    getGoogleAuth: getGoogleAuth,
    getGoogleCallback: getGoogleCallback,
    googleLogout: googleLogout
}