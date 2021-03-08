const { Schema, model } = require('mongoose');

const clickSchema = new Schema({
    referer: {
        type: String
    },
    ip: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Click', clickSchema);