const router = require('express').Router();

const { validURL, validInternalURI } = require('./helpers/validation');
const { generateUniqueURI } = require('./helpers/generateURI');
const { extractTargetUrl } = require('./helpers/extractURL');
const { attemptAuthetication } = require('../middlewares/auth');
const Link = require('../models/link');
const UriStorage = require('../models/uriStorage');

// POST /
// @desc Post a link to be shortened, receive URI
router.post('/',attemptAuthetication, async (req, res) => {
    // Validate url
    const { url } = req.body;
    if (!validURL(url)) return res.json({error: 'Invalid URL'});
    // Proceed only if storage is accessible
    const uriStorage = await UriStorage.findOne();
    if (!uriStorage) return res.json({error: 'Internal server error: cannot reach database'});
    try {
        const params = {};
        params.targetURL = extractTargetUrl(url);
        const shortURI = await generateUniqueURI(uriStorage);
        params.shortURI = shortURI;
        if (req.user) params.user = req.user.id;
        const link = new Link(params);
        await link.save();
        res.json({uri: shortURI});
    } catch (error) {
        console.log(error);
        return res.json({error: `Internal server error: ${error}`});
    }
})

// GET /:id
// @desc Access URI, get redirected to the stored URL
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!validInternalURI(id)) return res.json({error: 'Invalid parameters'});
    const link = await Link.findOne({shortURI: id});
    if (!link) return res.json({error: 'Link does not exist'});
    const url = link.targetURL;
    res.redirect(`https://${url}`);
});



module.exports = router;