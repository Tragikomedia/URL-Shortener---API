const app = require('../server');
const request = require('supertest')(app);

const db = require('../config/db');
const uriStorage = require('../config/uriStorage');

const User = require('../models/user');
const Link = require('../models/link');
const Click = require('../models/click');
const { signJWT } = require('../helpers/jwt');
const uriMatcher = /^[a-zA-Z0-9]{7}$/;

beforeAll(async (done) => {
  await db.connect();
  await uriStorage.initialize();
  done();
});

afterAll(async (done) => {
  await cleanUp();
  await db.disconnect();
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

describe('GET /user/links/', () => {
  it('Given a proper JWT of a valid user, should list all links of the user', async () => {
    // Creating a user is necessary due to authentication
    const user = new User({
      externalId: 'aabb546',
      provider: 'Facebook',
      name: 'Somebody',
    });
    await user.save();
    const token = signJWT(user);
    // Post links
    const url1 = 'wykop.pl';
    const url2 = 'facebook.com';
    await request
      .post('/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: url1 });
    await request
      .post('/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: url2 });
    // Get a list of links
    const res = await request
      .get('/user/links/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const { linksData } = res.body;
    expect(linksData.length).toBe(2);
    expect(linksData.find((link) => link.targetURL === url1)).toBeTruthy();
    expect(linksData.find((link) => link.targetURL === url2)).toBeTruthy();
  });
  it('Given a JWT pointing at a invalid user, should get status Unauthorized', async () => {
    const user = new User({
      externalId: 'aueufe',
      provider: 'Facebook',
      name: 'Nobody',
    });
    const token = signJWT(user);
    const res = await request
      .get('/user/links/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
  it('Given an invalid JWT, should get status Unauthorized', async () => {
    const res = await request
      .get('/user/links/')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ToJestSkandal');
    expect(res.status).toBe(401);
  });
  it('Given no JWT, should get status Unauthorized', async () => {
    const res = await request
      .get('/user/links/')
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(401);
  });
});

describe('GET /user/links/:id', () => {
  it('Given a URI of basic fresh link, should return brief linkData', async () => {
    const user = new User({
      externalId: 'cccbbn34',
      provider: 'Facebook',
      name: 'Nobody Important',
    });
    await user.save();
    const targetURL = 'example.info';
    const shortURI = 'erew45k';
    const link = new Link({
      targetURL,
      shortURI,
      user: user.id,
    });
    await link.save();
    const token = signJWT(user);
    const res = await request
      .get(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const { linkData } = res.body;
    expect(linkData).toBeTruthy();
    expect(linkData.targetURL).toMatch(targetURL);
    expect(linkData.shortURI).toMatch(shortURI);
    expect(linkData.clicks.length).toBe(0);
    expect(linkData.expiresAt).toBeFalsy();
    expect(linkData.maxClicks).toBeFalsy();
  });
  it('Given a URI of a used link, should return detailed linkData', async () => {
    const user = new User({
      externalId: 'cc33bn34',
      provider: 'Facebook',
      name: 'No-body Important',
    });
    await user.save();
    const targetURL = 'example.uk';
    const shortURI = 'empre32';
    const link = new Link({
      targetURL,
      shortURI,
      user: user.id,
      expiresAt: new Date('2040'),
      maxClicks: 15,
    });
    const click1 = new Click();
    const click2 = new Click();
    link.clicks.push(click1.id);
    link.clicks.push(click2.id);
    await link.save();
    const token = signJWT(user);
    const res = await request
      .get(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const { linkData } = res.body;
    expect(linkData).toBeTruthy();
    expect(linkData.targetURL).toMatch(targetURL);
    expect(linkData.shortURI).toMatch(shortURI);
    expect(linkData.clicks.length).toBe(2);
    expect(new Date(linkData.expiresAt)).toEqual(new Date('2040'));
    expect(linkData.maxClicks).toBe(15);
  });
  it('Given a request made by an unauthorized user, should receive status Unauthorized', async () => {
    const res = await request
      .get('/user/links/aabbcce')
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(401);
  });
  it('Given a request pointing at uri of non-existent link, should receive error', async () => {
    const user = new User({
      externalId: 'cc32bn34',
      provider: 'Facebook',
      name: 'Nbody Important',
    });
    await user.save();
    const token = signJWT(user);
    const res = await request
      .get('/user/links/buba691')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.error).toBeTruthy();
    expect(res.body.linkData).toBeUndefined();
  });
});

describe('DELETE /user/:id', () => {
  it('Given an existing uri and a user, should delete link and return 204', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht665';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
    });
    await link.save();
    const res = await request
      .post(`/user/links/${shortURI}?_method=DELETE`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
    const foundLink = await Link.findById(link.id);
    expect(foundLink).toBeFalsy();
  });
  it('Given an non-existent uri and a user, should return 204', async () => {
    const user = new User({
      externalId: 'cc32ber4',
      provider: 'Facebook',
      name: 'Jerry Buzzer',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'ohp665';
    const res = await request
      .post(`/user/links/${shortURI}?_method=DELETE`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});

describe('Complex behavior', () => {
  it('Given a user who posts, clicks, lists and deletes links, should not fail', async () => {
    const user = new User({
      externalId: '07zglossie',
      provider: 'Google',
      name: 'Borewicz',
    });
    await user.save();
    const token = signJWT(user);
    const linkUrl1 = 'coolwebsite.com';
    const linkOptions1 = {
      maxClicks: 2,
    };
    const postRes = await request
      .post('/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: linkUrl1, options: linkOptions1 });
    const { uri } = postRes.body;
    expect(uri).toMatch(uriMatcher);
    await request.get(`/${uri}`);
    const getRes1 = await request.get(`/${uri}`);
    expect(getRes1.headers.location).toMatch('https://coolwebsite.com');
    const getRes2 = await request.get(`/${uri}`);
    expect(getRes2.text).toBeTruthy();
    expect(getRes2.text.startsWith('<!DOCTYPE')).toBeTruthy();
    const getList = await request
      .get('/user/links/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(getList.body.linksData.length).toBe(1);
    expect(getList.body.linksData[0].shortURI).toMatch(uri);
    const getLinkData = await request
      .get(`/user/links/${uri}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(getLinkData.body.linkData.shortURI).toMatch(uri);
    expect(getLinkData.body.linkData.clicks.length).toBe(2);
    const deleteRes = await request
      .post(`/user/links/${uri}?_method=DELETE`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);
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
