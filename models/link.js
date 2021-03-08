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
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    expired: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
    },
    maxClicks: {
        type: Number,
    },
    clicks: {
        type: [Schema.Types.ObjectId],
        ref: 'Click',
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const checkLinkExpiration = link => (link.maxClicks && link.maxClicks < link.clicks.length) || (link.expiresAt && link.expiresAt < Date.now());

linkSchema.methods.isExpired = function() {
    if (!this.expired) this.expired = checkLinkExpiration(this);
    return this.expired;
}

linkSchema.methods.expire = async function() {
    this.expired = true;
    try {
        await this.save();
    } catch (error) {
        return {error};
    }
}

module.exports = model('Link', linkSchema);