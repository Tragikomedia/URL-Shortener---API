process.env.NODE_ENV = "test";
require('dotenv').config();

const app = require('../server');
const request = require('supertest')(app);

const db = require('../config/db');
const uriStorage = require('../config/uriStorage');

const User = require('../models/user');
const { signJWT } = require('../helpers/jwt');

beforeAll( async done => {
    await db.connect()
    await uriStorage.initialize();
    done();
});

afterAll(async done => {
    await cleanUp();
    await db.disconnect();
    done();
});

describe('POST /', () => {
    it('Send incorrect url, receive error', async done => {
        const badUrl = "ugabuga";
        const res = await request.post('/').set('Content-Type', 'application/json').send({url: badUrl});
        expect(res.body?.error).toBe("Invalid URL");
        done();
    });
    it('Send proper url, receive message', async done => {
        const properUrl = "ugabuga.com";
        const res = await request.post('/').set('Content-Type', 'application/json').send({url: properUrl});
        expect(res.body?.uri).toBeTruthy();
        expect(res.body?.uri).toMatch(/^[a-z0-9]{7}$/);
        done();
    });
});

describe('GET /:id', () => {
    it('Send correct uri as params, get redirected to corresponding url', async () => {
        const url = 'www.wykop.pl';
        const postRes = await request.post('/').set('Content-Type', 'application/json').send({url});
        const uri = postRes.body?.uri;
        expect(uri).toMatch(/^[a-z0-9]{7}$/);
        const getRes = await request.get(`/${uri}`);
        const redirectedURL = getRes.headers?.location;
        expect(redirectedURL).toMatch('https://wykop.pl');
    });
});

describe('GET /user/all', () => {
    it('Given a proper JWT of a valid user, should list all links of the user', async () => {
        // Creating a user is necessary due to authentication
        const user = new User({externalId: 'aabb546', provider: 'Facebook', name: 'Somebody'});
        await user.save();
        const token = signJWT(user);
        // Post links
        const url1 = 'wykop.pl';
        const url2 = 'facebook.com';
        await request.post('/').set('Content-Type', 'application/json').set('Authorization', `Bearer ${token}`).send({url: url1});
        await request.post('/').set('Content-Type', 'application/json').set('Authorization', `Bearer ${token}`).send({url: url2});
        // Get a list of links
        const res = await request.get('/user/all').set('Content-Type', 'application/json').set('Authorization', `Bearer ${token}`);
        const { linksData } = res.body;
        expect(linksData.length).toBe(2);
        expect(linksData.find(link => link.targetURL === url1)).toBeTruthy();
        expect(linksData.find(link => link.targetURL === url2)).toBeTruthy();
    });
    it('Given a fake JWT, should get status Unauthorized', async () => {
        const user = new User({externalId: 'aueufe', provider: 'Facebook', name: 'Nobody'});
        const token = signJWT(user);
        const res = await request.get('/user/all').set('Content-Type', 'application/json').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(401);
    });
    it('Given no JWT, should get status Unauthorized', async () => {
        const res = await request.get('/user/all').set('Content-Type', 'application/json');
        expect(res.status).toBe(401);
    });
});


// All the tests that meddle with Db should be in one place
// Otherwise, they might clean the Db while other tests are being processed

// Remove all the elements from test database
async function cleanUp() {
    const Link = require('../models/link');
    const UriStorage = require('../models/uriStorage');
    await Link.deleteMany();
    await UriStorage.deleteMany();
    await User.deleteMany();
}