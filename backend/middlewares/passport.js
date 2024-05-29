const passport = require('passport');
const config = require('../config');
const User = require('../Model/userModel');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
        clientID: config.googleAuth.clientId,
        clientSecret: config.googleAuth.clientSecret,
        callbackURL: config.googleAuth.redirectUrl
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({googleId: profile.id})
            if(!user) {
                const logResult = {
                    userId: profile.id,
                    statusCode: 200,
                }
                logger.info('User via google email id is registered', logFormat(null, logResult))
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    avatar: {
                        data: profile.photos[0].value,
                        imgType: 'image/png'
                    },
                    email: profile.emails[0].value,
                });
            }
            return done(null, user)
        } catch(err) {
            return done(err, null)
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } 
    catch(err) {
        done(err, null)
    }
})