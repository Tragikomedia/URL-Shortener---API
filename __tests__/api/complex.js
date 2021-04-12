const app = require('../../server');
const request = require('supertest')(app);

const db = require('../../config/db');
const uriStorage = require('../../config/uriStorage');

const User = require('../../models/user');
const { signJWT } = require('../../helpers/jwt');
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
