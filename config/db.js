const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../helpers/logger');
const Link = require('../models/link');
const User = require('../models/user');
const Click = require('../models/click');
const UriStorage = require('../models/uriStorage');

async function connect() {
  try {
    let mongoURL = env.DATABASE_URL;
    await mongoose.connect(
      mongoURL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      },
      () => logger.info('Connected to the DB...')
    );
  } catch (error) {
    logger.error(error);
  }
}

async function disconnect() {
  await mongoose.connection.close?.();
}

async function clean() {
  if (env.NODE_ENV === 'test') {
    await Link.deleteMany({});
    await Click.deleteMany({});
    await User.deleteMany({});
    await UriStorage.deleteMany({});
  }
}

module.exports = { connect, disconnect, clean };
