const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  externalId: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('User', userSchema);
