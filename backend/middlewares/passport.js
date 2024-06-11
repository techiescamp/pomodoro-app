const passport = require('passport');
const config = require('../config');
const User = require('../Model/userModel');
const logger = require('../Logger/logger');
const logFormat = require('../Logger/logFormat');
const metrics = require('../Observability/metrics');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
        clientID: config.googleAuth.clientId,
        clientSecret: config.googleAuth.clientSecret,
        callbackURL: config.googleAuth.redirectUrl
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            const queryStartTime = hrtime();
            let user = await User.findOne({googleId: profile.id})
            //
            const queryEndTime = process.hrtime(queryStartTime);
            const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
            metrics.databaseQueryDurationHistogram.observe({operation: 'passport.js middleware find user - findOne', success: existingUser ? 'true': 'false'}, queryDuration / 1e9);
    
            if(!user) {
                const logResult = {
                    userId: profile.id,
                    statusCode: 200,
                }
                logger.info('User via google email id is registered', logFormat(null, logResult));
                const queryStartTime = hrtime();
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    avatar: {
                        data: profile.photos[0].value,
                        imgType: 'image/png'
                    },
                    email: profile.emails[0].value,
                });
                //
                const queryEndTime = process.hrtime(queryStartTime);
                const queryDuration = queryEndTime[0] * 1e9 + queryEndTime[1];
                metrics.databaseQueryDurationHistogram.observe({operation: 'passport.js middleware create new user - create', success: user ? 'true': 'false'}, queryDuration / 1e9);
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