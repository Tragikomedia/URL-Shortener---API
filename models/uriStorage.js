const { Schema, model } = require('mongoose');

const uriStorageSchema = new Schema({
  uris: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
  },
});

module.exports = model('UriStorage', uriStorageSchema);
