const router = require('express').Router();
const passport = require('passport');
const { signJWT } = require('./helpers/jwt');

// GET /facebook
// @desc Login via Facebook
router.get('/facebook', passport.authenticate('facebook', {session: false}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    session: false,
}), passTokenToClient);

// GET /google
// @desc Login via Google OAuth 2.0
router.get('/google', passport.authenticate('google', {
    session: false, scope: ['https://www.googleapis.com/auth/plus.login'] // scope is obligatory for Google
}));

router.get('/google/callback', passport.authenticate('google', {
    session: false,
}), passTokenToClient);

function passTokenToClient(req, res) {
    console.log(req.user);
    const token = signJWT(req.user);
    // You render a view where script passes the token to client via postMessage
    res.render('auth.html', {token});
}

module.exports = router;