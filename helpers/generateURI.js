const chars = "1234567890qwertyuiopasdfghjklzxcvbnm";
const charsLen = chars.length;
const uriLength = 7;

const generateUniqueURI = async (uriStorage) => {
    const storedURIs = uriStorage.uris;
    let newURI = generateShortURI();
    let isUnique = !storedURIs.includes(newURI);
    while(!isUnique) {
        newURI = modifyUriAtRandom(newURI);
        isUnique = !storedURIs.includes(newURI);
    }
    uriStorage.uris.push(newURI);
    try {
        await uriStorage.save();
    } catch (error) {
        console.log(error);
        throw new Error('Error while saving storage');   
    }
    return newURI;
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

module.exports = { generateUniqueURI };