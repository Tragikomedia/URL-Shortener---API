const router = require('express').Router();

const { validURL } = require('../helpers/validation');
const { attemptAuthetication } = require('../middlewares/auth');
const { updateLinkStats } = require('../helpers/linkStats');
const Link = require('../models/link');

// POST /
// @desc Post a link to be shortened, receive URI
router.post('/',attemptAuthetication, async (req, res) => {
    const { url } = req.body;
    if (!validURL(url)) return res.json({error: 'Invalid URL'});
    const { error, link } = await Link.fromReq(req);
    if (error) return res.json({error});
    try {
        await link.save();
    } catch (error) {
        return res.json({error: `Internal server error: ${error}`});
    }
    res.json({uri: link.shortURI});
});

// GET /:id
// @desc Access URI, get redirected to the stored URL
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { error, link } = await Link.findByUri(id);
    if (error) return res.json({error});
    const url = link.targetURL;
    res.redirect(`https://${url}`);
    // Useful only for stats or click-related expiration
    if (link.user || link.maxClicks) {
        const {error} = await updateLinkStats(req, link);
        if (error) console.error(`Could not save updated data: ${error}`);
    }
});

module.exports = router;