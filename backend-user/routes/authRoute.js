const express = require('express');
const passport = require('passport');
const config = require('../config');

const route = express.Router();

route.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "failure"
    })
});

route.get("/login/success", (req, res) => {
    if(req.user) {
        res.status(200).json({
            success: true,
            message: "successful",
            user: req.user,
            // cookie: req.cookies
        })
    }  
})

// To initiate the Google OAuth2.0 authentication flow
route.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

// callback URL for handling the OAuth2.0 response
route.get('/google/callback', passport.authenticate('google', { 
        successRedirect: config.urls.baseUrl,
        failureRedirect: '/login/failed' 
    }) 
);

route.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect(config.urls.baseUrl);
      });
});



module.exports = route;