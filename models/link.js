const { Schema, model } = require('mongoose');
const { getLinkParams, getUpdateParams } = require('../helpers/linkParams');
const Click = require('./click');

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
  return checkLinkExpiration(this);
};

linkSchema.methods.expire = async function () {
  this.expired = true;
  try {
    await this.save();
    return {};
  } catch (error) {
    return { error };
  }
};

// Querying
const { validInternalURI } = require('../helpers/validation');
linkSchema.statics.findByUri = async function (uri) {
  if (!validInternalURI(uri)) return { error: 'Invalid link ID' };
  const link = await this.findOne({ shortURI: uri });
  if (!link) return { error: 'Link does not exist' };
  if (link.expired) return { error: 'Expired link' };
  if (link.isExpired()) {
    const { error } = await link.expire();
    return { error: error ?? 'Expired link' };
  }
  return { link };
};

linkSchema.statics.findByUserId = async function (id) {
  if (!id) return [];
  const links = await this.find({ user: id }).exec();
  return links;
};

linkSchema.statics.findInUserLinks = async function (user, uri) {
  if (!(user && uri))
    return { error: 'Not enough data to find the link', status: 400 };
  const link = await this.findOne({
    user: user.id,
    shortURI: uri,
  }).populate('clicks', { ip: 1, time: 1, referer: 1 });
  if (!link) return { error: 'Such link does not exist', status: 404 };
  return { link };
};

// Creation
linkSchema.statics.fromReq = async function (req) {
  const { error, params } = await getLinkParams(req);
  if (error) return { error };
  const link = new this(params);
  return { link };
};

// Update
linkSchema.statics.updateStats = async function (req, link) {
  const click = Click.fromReq(req);
  link.clicks.push(click.id);
  try {
    // Link has priority - important for expiration purposes
    await link.save();
    await click.save();
  } catch (error) {
    return { error };
  }
  return {};
};

linkSchema.statics.updateByReq = async function (req) {
  const { id } = req.params;
  const { user } = req;
  const { error, updateObj } = getUpdateParams(req);
  if (error) return { error, status: 400 };
  const link = await this.findOne({ user: user.id, shortURI: id });
  if (!link) return { error: 'Could not find link', status: 404 };
  try {
    await link.updateOne(updateObj);
    await link.save();
  } catch (error) {
    return { error, status: 500 };
  }
  return {};
};

// Deletion
linkSchema.statics.deleteUserLink = async function (user, uri) {
  if (!(user && uri))
    return { error: 'Not enough data to find the link', status: 400 };
  try {
    await this.findOneAndRemove({ user: user.id, shortURI: uri });
  } catch (error) {
    return { error, status: 500 };
  }
  return {};
};

module.exports = model('Link', linkSchema);
