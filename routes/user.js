const router = require('express').Router();
const Link = require('../models/link');
const { authenticateUser } = require('../middlewares/auth');
const { extractData } = require('../helpers/linkData');

// GET /user/all
// @desc Get all links posted by the user
router.get('/all', authenticateUser, async (req, res) => {
    const links = await Link.findByUserId(req.user?.id);
    const linksData = await extractData(links);
    const message = {
        name: req.user.name,
        linksData
    };
    res.json(message);
});

module.exports = router;