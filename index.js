const env = require('./config/env');
const db = require('./config/db');
const app = require('./server');
const uriStorage = require('./config/uriStorage');

const runServer = async () => {
  await db.connect();
  await uriStorage.initialize();
  app.listen(env.PORT);
};

runServer();
