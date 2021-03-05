const router = require('express').Router();

const { validURL } = require('./helpers/validateURL');
const Link = require('../models/link');
const UriStorage = require('../models/uriStorage');

router.post('/', (req, res) => {
    const { url } = req.body;
    if (!validURL(url)) return res.json({error: 'Invalid URL'});
    const link = new Link({targetURL: url, shortURI: generateShortURI()});
    const uriStorage = UriStorage.find();
    console.log(uriStorage);
    res.json({message: 'Success!'});
})

router.get('/:id', (req, res) => {

});

const generateUniqueURI = async () => {
    const storedURIs = {};
    (await Link.find()).forEach(link => {
        storesURIs[link.shortURI] = true;
    });
    let newURI = generateShortURI();
    let isUnique = storedURIs.newURI;
    while(!isUnique) {
        newURI = modifyUriAtRandom(newURI);
        isUnique = storedURIs.newURI;
    }
}
const chars = "1234567890qwertyuiopasdfghjklzxcvbnm";
const charsLen = chars.length;
const uriLength = 7;
function modifyUriAtRandom(uri) {
    const indexOfChange = Math.floor(Math.random() * uriLength);
    const modifiedURI = uri.slice(0, indexOfChange) + getRandomChar + uri.slice(indexOfChange + 1);
    return modifiedURI;
}
function getRandomChar() {
    return chars[Math.floor(Math.random() * charsLen)];
}
function generateShortURI() {
    let uri = "";
    for (let i = 0; i < uriLength; i++) {
        uri += getRandomChar();
    }
    return uri;
}

module.exports = router;