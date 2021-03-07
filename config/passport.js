const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

// Facebook Strategy
const facebookStrategy = new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_CALLBACK
},
setUpStrategy('Facebook'));

// Google Strategy
const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
}, 
setUpStrategy('Google'));

function setUpStrategy(provider) {
    return async function(accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({externalId: profile.id, provider});
            if (!user) {
                user = new User({
                    externalId: profile.id,
                    provider,
                    name: profile.displayName
                });
                await user.save();
            }
            done(null, user);
        } catch(error) {
            done(error);
        }
    };
}

// JWT Strategy
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}
const jwtStrategy = new JWTStrategy(opts, async function(jwt_payload, done) {
    try {
        const user = await User.findById(jwt_payload.id);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(facebookStrategy);
passport.use(googleStrategy);
passport.use(jwtStrategy);

module.exports = passport;