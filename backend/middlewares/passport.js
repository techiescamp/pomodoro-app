const passport = require('passport');
const config = require('../config');
const User = require('../Model/userModel');
const GoogleStrategy = require('passport-google-oauth20');

passport.use(new GoogleStrategy({
        clientID: config.googleAuth.clientId,
        clientSecret: config.googleAuth.clientSecret,
        callbackURL: config.googleAuth.redirectUrl
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({googleId: profile.id})
            if(user) {
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    avatar: {
                        data: profile.photos[0].value,
                        imgType: 'image/png'
                    },
                    email: profile.emails[0].value,
                    password: ''
                });
            }
            return done(null, user)
        } catch(err) {
            return done(err)
        }
    }
));


passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } 
    catch(err) {
        done(err)
    }
})