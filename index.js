if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const db = require('./config/db');
const app = require('./server');
const uriStorage = require('./config/uriStorage');

const runServer = async () => {
    await db.connect();
    await uriStorage.initialize();
    app.listen(process.env.PORT || 3000);
}

runServer();