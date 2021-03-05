const { Schema, model } = require('mongoose');

const linkSchema = new Schema({
    targetURL: {
        type: String,
        required: true
    },
    shortURI: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Link', linkSchema);