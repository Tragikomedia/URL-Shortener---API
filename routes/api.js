const router = require('express').Router();

const { validURL } = require('../helpers/validation');
const { generateUniqueURI } = require('../helpers/generateURI');
const { extractTargetUrl } = require('../helpers/extractURL');
const { attemptAuthetication } = require('../middlewares/auth');
const { updateLinkStats } = require('../helpers/linkStats');
const Link = require('../models/link');
const UriStorage = require('../models/uriStorage');


// POST /
// @desc Post a link to be shortened, receive URI
router.post('/',attemptAuthetication, async (req, res) => {
    // Validate url
    const { url, options } = req.body;
    if (!validURL(url)) return res.json({error: 'Invalid URL'});
    // Proceed only if storage is accessible
    const uriStorage = await UriStorage.findOne();
    if (!uriStorage) return res.json({error: 'Internal server error: cannot reach database'});
    try {
        const params = {};
        params.targetURL = extractTargetUrl(url);
        const shortURI = await generateUniqueURI(uriStorage);
        params.shortURI = shortURI;
        if (options?.maxClicks) params.maxClicks = options.maxClicks; 
        if (options?.expiresAt) params.expiresAt = options.expiresAt;
        if (req.user) params.user = req.user.id;
        const link = new Link(params);
        await link.save();
        res.json({uri: shortURI});
    } catch (error) {
        return res.json({error: `Internal server error: ${error}`});
    }
})

// GET /:id
// @desc Access URI, get redirected to the stored URL
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { error, link } = await Link.findByUri(id);
    if (error) res.json({error});
    const url = link.targetURL;
    res.redirect(`https://${url}`);
    // Useful only for stats or click-related expiration
    if (link.user || link.maxClicks) {
        const {error} = await updateLinkStats(req, link);
        if (error) console.error(`Could not save updated data: ${error}`);
    }
});

module.exports = router;