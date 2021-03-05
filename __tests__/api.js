process.env.NODE_ENV = "test";

const app = require('../server');
const request = require('supertest')(app);

const db = require('../config/db');
const uriStorage = require('../config/uriStorage');

beforeAll( async done => {
    await db.connect()
    await uriStorage.initialize();
    done();
});

afterAll(done => {
    db.disconnect();
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
        expect(redirectedURL).toMatch(url);
    });
});