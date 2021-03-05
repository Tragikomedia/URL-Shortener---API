const UriStorage = require('../models/uriStorage');

const initialize = async (attempt = 0) => {
    const storage = await UriStorage.find();
    if (storage.length === 0) {
        const newStorage = new UriStorage({uris: []});
        try {
            await newStorage.save();
        } catch (error) {
            console.error(error);
            // Try to initialize 3 times before throwing an error
            if (attempt < 3) await initialize(attempt + 1);
            else throw new Error(error);
        }
    }
}

module.exports = { initialize };
