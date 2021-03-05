const router = require('express').Router();

const { validURL, validInternalURI } = require('./helpers/validation');
const { generateUniqueURI } = require('./helpers/generateURI');
const Link = require('../models/link');
const UriStorage = require('../models/uriStorage');

// POST /
// @desc Post a link to be shortened, receive URI
router.post('/', async (req, res) => {
    // Validate url
    const { url } = req.body;
    if (!validURL(url)) return res.json({error: 'Invalid URL'});
    // Proceed only if storage is accessible
    const uriStorage = await UriStorage.findOne();
    if (!uriStorage) return res.json({error: 'Internal server error: cannot reach database'});
    try {
        const shortURI = await generateUniqueURI(uriStorage);
        const link = new Link({targetURL: url, shortURI});
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
    if (!validInternalURI(id)) return res.json({error: 'Invalid parameters'});
    const link = await Link.findOne({shortURI: id});
    if (!link) return res.json({error: 'Link does not exist'});
    const url = link.targetURL;
    res.redirect(url);
});



module.exports = router;