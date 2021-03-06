const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

// Facebook Strategy
const facebookStrategy = new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_CALLBACK
},
async function(accessToken, refreshToken, profile, done) {
    let user;
    try {
        user = await User.findOne({externalId: profile.id});
        if (!user) {
            user = new User({
                externalId: profile.id,
                provider: 'Facebook',
                name: profile.displayName
            });
            await user.save();
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(facebookStrategy);

module.exports = passport;