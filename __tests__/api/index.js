const app = require('../../server');
const request = require('supertest')(app);

const db = require('../../config/db');
const uriStorage = require('../../config/uriStorage');

const uriMatcher = /^[a-zA-Z0-9]{7}$/;

beforeAll(async (done) => {
  await db.connect();
  done();
});

afterAll(async (done) => {
  await db.disconnect();
  done();
});

beforeEach(async (done) => {
  await db.clean();
  await uriStorage.initialize();
  done();
});

describe('POST /', () => {
  it('Send incorrect url, receive error', async (done) => {
    const badUrl = 'ugabuga';
    const res = await request
      .post('/')
      .set('Content-Type', 'application/json')
      .send({ url: badUrl });
    expect(res.body?.error).toBe('Invalid URL');
    done();
  });
  it('Send proper url, receive message', async (done) => {
    const properUrl = 'ugabuga.com';
    const res = await request
      .post('/')
      .set('Content-Type', 'application/json')
      .send({ url: properUrl });
    expect(res.body?.uri).toBeTruthy();
    expect(res.body?.uri).toMatch(uriMatcher);
    done();
  });
});

describe('GET /:id', () => {
  it('Send correct uri as params, should get redirected to corresponding url', async () => {
    const url = 'www.wykop.pl';
    const postRes = await request
      .post('/')
      .set('Content-Type', 'application/json')
      .send({ url });
    const uri = postRes.body?.uri;
    expect(uri).toMatch(uriMatcher);
    const getRes = await request.get(`/${uri}`);
    const redirectedURL = getRes.headers?.location;
    expect(redirectedURL).toMatch('https://wykop.pl');
  });
  it('Send incorrect uri as params, should receive error message', async () => {
    const res = await request.get('/bababu1');
    expect(res.text).toBeTruthy();
    expect(res.text.startsWith('<!DOCTYPE')).toBeTruthy();
  });
  it('Send correct uri of a link that exceeded click limit, should receive error message', async () => {
    const url = 'www.example.pl';
    const options = {
      maxClicks: 2,
    };
    const postRes = await request
      .post('/')
      .set('Content-Type', 'application/json')
      .send({ url, options });
    const uri = postRes.body.uri;
    const res1 = await request.get(`/${uri}`);
    expect(res1.headers.location).toMatch('https://example.pl');
    const res2 = await request.get(`/${uri}`);
    expect(res2.headers.location).toMatch('https://example.pl');
    const res3 = await request.get(`/${uri}`);
    expect(res3.text).toBeTruthy();
    expect(res3.text.startsWith('<!DOCTYPE')).toBeTruthy();
  });
  it('Send correct uri of a link that expired, should receive error message', async () => {
    const url = 'www.example.be';
    const options = {
      expiresAt: new Date('1999', '07', '13'),
    };
    const postRes = await request
      .post('/')
      .set('Content-Type', 'application/json')
      .send({ url, options });
    const uri = postRes.body.uri;
    const res = await request.get(`/${uri}`);
    expect(res.text).toBeTruthy();
    expect(res.text.startsWith('<!DOCTYPE')).toBeTruthy();
  });
});