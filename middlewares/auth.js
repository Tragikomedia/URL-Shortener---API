const passport = require('passport');

const authenticateUser = (req, res, next) =>
  passport.authenticate('jwt', { session: false })(req, res, next);

// Use custom callback to override default behaviour and let unauthenticated users proceed
const attemptAuthetication = (req, res, next) =>
  passport.authenticate('jwt', { session: false }, function (err, user) {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);

module.exports = { authenticateUser, attemptAuthetication };
