const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../helpers/logger');

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

module.exports = { connect, disconnect };
