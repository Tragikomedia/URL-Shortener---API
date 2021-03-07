const passport = require("passport");

const authenticateUser = (req, res, next) => passport.authenticate('jwt', {session: false})(req, res, next);

// Use custom callback to override default behaviour and let unauthenticated users proceed
const attemptAuthetication = (req, res, next) => passport.authenticate('jwt', {session: false}, function(err, user, info) {
    if (user) {
        req.logIn(user, function(err) {
            if (err) return next(err);
            return next();
        });
    }
    next();
})(req, res, next);
module.exports = { authenticateUser, attemptAuthetication };