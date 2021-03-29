const { Schema, model } = require('mongoose');

const linkSchema = new Schema({
  targetURL: {
    type: String,
    required: true,
  },
  shortURI: {
    type: String,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  expired: {
    type: Boolean,
    default: false,
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
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Expiration
const checkLinkExpiration = (link) =>
  (link.maxClicks && link.maxClicks <= link.clicks.length) ||
  (link.expiresAt && link.expiresAt < Date.now());

linkSchema.methods.isExpired = function () {
  if (!this.expired) this.expired = checkLinkExpiration(this);
  return this.expired;
};

linkSchema.methods.expire = async function () {
  if (!this.expired) {
    this.expired = true;
    try {
      await this.save();
    } catch (error) {
      return { error };
    }
  }
};

// Querying
const { validInternalURI } = require('../helpers/validation');
linkSchema.statics.findByUri = async function (uri) {
  if (!validInternalURI(uri)) return { error: 'Invalid link ID' };
  const link = await this.findOne({ shortURI: uri });
  if (!link) return { error: 'Link does not exist' };
  if (link.isExpired()) {
    await link.expire();
    return { error: 'Expired link' };
  }
  return { link };
};

linkSchema.statics.findByUserId = async function (id) {
  if (!id) return [];
  const links = await this.find({ user: id }).exec();
  return links;
};

linkSchema.statics.findInUserLinks = async function (user, uri) {
  if (!(user && uri)) return { error: 'Not enough data to find the link', status: 400 };
  const link = await this.findOne({ user: user.id, shortURI: uri });
  if (!link) return { error: 'Such link does not exist', status: 404 };
  return { link };
};

// Creation
const { getLinkParams } = require('../helpers/linkParams');
linkSchema.statics.fromReq = async function (req) {
  const { error, params } = await getLinkParams(req);
  if (error) return { error };
  const link = new this(params);
  return { link };
};

// Deletion
linkSchema.statics.deleteUserLink = async function (user, uri) {
  if (!(user && uri)) return { error: 'Not enough data to find the link', status: 400 };
  try {
    await this.findOneAndRemove({ user: user.id, shortURI: uri });
  } catch (error) {
    return { error, status: 500 };
  }
  return {};
};

module.exports = model('Link', linkSchema);
