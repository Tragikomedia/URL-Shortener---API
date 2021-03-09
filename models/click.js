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

// Static
const Click = require('../models/click');
const requestIp = require('request-ip');

clickSchema.statics.fromReq = function(req) {
    const stats = {};
    stats.ip = requestIp.getClientIp(req);
    if (req.headers?.referer) stats.referer = req.headers.referer;
    const click = new this(stats);
    return click;
}

module.exports = model('Click', clickSchema);