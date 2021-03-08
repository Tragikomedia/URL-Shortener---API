const UriStorage = require('../models/uriStorage');

const chars = "1234567890qwertyuiopasdfghjklzxcvbnm";
const charsLen = chars.length;
const uriLength = 7;

const getUri = async () => {
    // Proceed only if storage is accessible!
    const uriStorage = await UriStorage.findOne();
    if (!uriStorage) return {error: 'Internal server error: cannot reach database'};
    return await generateUniqueURI(uriStorage);
}

const generateUniqueURI = async (uriStorage) => {
    const storedURIs = uriStorage.uris;
    let shortURI = generateShortURI();
    let isUnique = !storedURIs.includes(shortURI);
    while(!isUnique) {
        shortURI = modifyUriAtRandom(shortURI);
        isUnique = !storedURIs.includes(shortURI);
    }
    uriStorage.uris.push(shortURI);
    try {
        await uriStorage.save();
    } catch (error) {
        return {error}; 
    }
    return {shortURI};
}
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

module.exports = { generateUniqueURI, getUri };