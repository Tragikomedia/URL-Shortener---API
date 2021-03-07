const router = require('express').Router();
const Link = require('../models/link');
const { authenticateUser } = require('../middlewares/auth');

// GET /user/all
// @desc Get all links posted by the user
router.get('/all', authenticateUser, async (req, res) => {
    const links = await Link.find({user: req.user.id}).exec();
    const message = {
        name: req.user.name,
        links
    };
    res.json(message);
});

module.exports = router;