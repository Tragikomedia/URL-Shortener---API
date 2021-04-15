const app = require('../../server');
const request = require('supertest')(app);

const db = require('../../config/db');
const uriStorage = require('../../config/uriStorage');

const User = require('../../models/user');
const Link = require('../../models/link');
const { signJWT } = require('../../helpers/jwt');

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
  it('Given a proper JWT of a valid user, returned links should include info about id, targetURL, shortURI and expiration', async () => {
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
    await request
      .post('/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: url1 });
    // Get a list of links
    const res = await request
      .get('/user/links/')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const { linksData } = res.body;
    expect(linksData.length).toBe(1);
    expect(Object.keys(linksData[0]).length).toBe(4);
    const { targetURL, expired, id, shortURI } = linksData[0];
    expect(targetURL).toBeDefined();
    expect(shortURI).toBeDefined();
    expect(id).toBeDefined();
    expect(expired).toBeDefined();
    expect(expired).toBe(false);
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
    await link.save();
    await request.get(`/${shortURI}`);
    await request.get(`/${shortURI}`);
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

describe('PUT /user/:id', () => {
  it('Given a request demanding expiration, the link should expire', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
    });
    await link.save();
    const preRes = await request.get(`/${shortURI}`);
    expect(preRes.status).toBe(302);
    const res = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expired: true });
    expect(res.status).toBe(204);
    const postRes = await request.get(`/${shortURI}`);
    expect(postRes.status).toBe(404);
  });
  it('Given a request revoking expiration without changing other conditions, the link should still be expired', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
      maxClicks: 1,
    });
    await link.save();
    const firstRes = await request.get(`/${shortURI}`);
    expect(firstRes.status).toBe(302);
    const secondRes = await request.get(`/${shortURI}`);
    expect(secondRes.status).toBe(404);
    const putRes = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expired: false });
    expect(putRes.status).toBe(204);
    const thirdRes = await request.get(`/${shortURI}`);
    expect(thirdRes.status).toBe(404);
  });
  it('Given a request changing expiration date and expired property, the date should be changed and link active', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
      maxClicks: 1,
      expiresAt: new Date('1999'),
    });
    await link.save();
    const firstRes = await request.get(`/${shortURI}`);
    expect(firstRes.status).toBe(404);
    const putRes = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expired: false, expiresAt: new Date('2037') });
    expect(putRes.status).toBe(204);
    const secondRes = await request.get(`/${shortURI}`);
    expect(secondRes.status).toBe(302);
  });
  it('Given a request changing maxClicks and expired property, maxClicks should be changed and link active', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
      maxClicks: 1,
    });
    await link.save();
    const firstRes = await request.get(`/${shortURI}`);
    expect(firstRes.status).toBe(302);
    const secondRes = await request.get(`/${shortURI}`);
    expect(secondRes.status).toBe(404);
    const putRes = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expired: false, maxClicks: 10 });
    expect(putRes.status).toBe(204);
    const thirdRes = await request.get(`/${shortURI}`);
    expect(thirdRes.status).toBe(302);
  });
  it('Given a request with no body, should receive status 400', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
    });
    await link.save();
    const res = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
  it('Given a request with malformatted date, should receive status 400', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
    });
    await link.save();
    const res = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expiresAt: 'zgroza' });
    expect(res.status).toBe(400);
  });
  it('Given a request with malformatted maxClicks, should receive status 400', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
    });
    await link.save();
    const res = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ maxClicks: 'buba' });
    expect(res.status).toBe(400);
  });
  it('Given a request with malformatted expired property, should receive status 400', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const shortURI = 'oht6652';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user.id,
    });
    await link.save();
    const res = await request
      .put(`/user/links/${shortURI}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expired: 'lelum polelum' });
    expect(res.status).toBe(400);
  });
  it('Given a request made by an unauthorized user, should receive status 401', async () => {
    const res = await request
      .put('/user/links/aabbcce')
      .set('Content-Type', 'application/json')
      .send({ expired: true });
    expect(res.status).toBe(401);
  });
  it('Given a request pointing at non-existing link, should receive status 404', async () => {
    const user = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user.save();
    const token = signJWT(user);
    const res = await request
      .put('/user/links/wrongli')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ expired: true });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /user/:id', () => {
  it('Given an existing uri and a user when using method override, should delete link and return 204', async () => {
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
  it('Given an existing uri and a user when directly using delete, should delete link and return 204', async () => {
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
      .delete(`/user/links/${shortURI}`)
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
    const shortURI = 'ohp6652';
    const res = await request
      .post(`/user/links/${shortURI}?_method=DELETE`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
  it('Given an existing uri posted by a one user, another user should not be able to delete it', async () => {
    const user1 = new User({
      externalId: 'cc32bee4',
      provider: 'Facebook',
      name: 'Marek Cukierberg',
    });
    await user1.save();
    const shortURI = 'oht6651';
    const link = new Link({
      targetURL: 'vikop.ru',
      shortURI,
      user: user1.id,
    });
    await link.save();
    const user2 = new User({
      externalId: 'c5930340',
      provider: 'Facebook',
      name: 'Paulo Dybala',
    });
    await user2.save();
    const token = signJWT(user2);
    const res = await request
      .post(`/user/links/${shortURI}?_method=DELETE`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    // Status 204 because alien user should not know if such a link exists
    expect(res.status).toBe(204);
    const foundLink = await Link.findById(link.id);
    expect(foundLink).toBeTruthy();
  });
});
