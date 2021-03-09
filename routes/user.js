const router = require('express').Router();
const Link = require('../models/link');
const { authenticateUser } = require('../middlewares/auth');
const { extractData, getLinkData } = require('../helpers/linkData');

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

// GET /user/:id
// @desc Get a particular link posted by the user
router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { error, link } = await Link.findInUserLinks(req.user, id);
    if (error) return res.json({error});
    const linkData = await getLinkData(link, 'exhaustive');
    res.json({linkData});
});

module.exports = router;