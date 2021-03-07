const router = require('express').Router();
const passport = require('passport');
const { signJWT } = require('./helpers/jwt');

router.get('/', (req, res) => {
    res.render('login.html');
});

router.get('/facebook', passport.authenticate('facebook', {session: false}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    session: false,
}), (req, res) => {
    const token = signJWT(req.user);
    // You render a view where script passes the token to client via postMessage
    res.render('auth.html', {token});
});

module.exports = router;