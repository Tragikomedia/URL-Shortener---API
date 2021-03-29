require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const DATABASE_URL = NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const FB_CLIENT_ID = process.env.FB_CLIENT_ID;
const FB_CLIENT_SECRET = process.env.FB_CLIENT_SECRET;
const FB_CALLBACK = process.env.SERVER_ADDRESS + 'auth/facebook/callback';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK = process.env.SERVER_ADDRESS + 'auth/google/callback';

module.exports = {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    CLIENT_URL,
    JWT_SECRET,
    FB_CLIENT_ID,
    FB_CLIENT_SECRET,
    FB_CALLBACK,
    GOOGLE_CLIENT_ID,
    GOOGLE_CALLBACK,
    GOOGLE_CLIENT_SECRET
};