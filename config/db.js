const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../helpers/logger');

async function connect() {
    let mongoURL = env.DATABASE_URL;
    const db = mongoose.connection;
    db.on('error', error => logger.error(error));
    db.once('open', () => logger.info('Connected to the DB...'));
    mongoose.set('useCreateIndex', true);
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
}

async function disconnect() {
    await mongoose.connection.close?.();
}

module.exports = { connect, disconnect };