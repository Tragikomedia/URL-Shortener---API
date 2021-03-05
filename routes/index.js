const router = require('express').Router();

const { validURL } = require('./helpers/validateURL');
const { generateUniqueURI } = require('./helpers/generateURI');
const Link = require('../models/link');
const UriStorage = require('../models/uriStorage');

router.post('/', async (req, res) => {
    // Validate url
    const { url } = req.body;
    if (!validURL(url)) return res.json({error: 'Invalid URL'});
    // Proceed only if storage is accessible
    const uriStorage = await UriStorage.findOne();
    if (!uriStorage) return res.json({error: 'Internal server error'});
    try {
        const shortURI = await generateUniqueURI(uriStorage);
        const link = new Link({targetURL: url, shortURI});
        await link.save();
        res.json({message: shortURI});
    } catch (error) {
        return res.json({error: `Internal server error: ${error}`});
    }
})

router.get('/:id', (req, res) => {

});



module.exports = router;