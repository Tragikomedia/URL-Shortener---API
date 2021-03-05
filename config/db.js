const mongoose = require('mongoose');

async function connect() {
    let mongoURL = process.env.NODE_ENV !== 'test' ? process.env.DATABASE_URL : "mongodb://localhost/test";
    const db = mongoose.connection;
    db.on('error', error => console.error(error));
    db.once('open', () => console.log('Connected to the DB...'));
    mongoose.set('useCreateIndex', true);
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function disconnect() {
    await mongoose.connection.close?.();
}

module.exports = { connect, disconnect };