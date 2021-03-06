const { generateUniqueURI } = require('../../helpers/generateURI');

const db = require('../../config/db');
const uriStorage = require('../../config/uriStorage');
const UriStorage = require('../../models/uriStorage');

beforeAll(async (done) => {
  await db.connect();
  done();
});

afterAll((done) => {
  db.disconnect();
  done();
});

beforeEach(async (done) => {
  await db.clean();
  await uriStorage.initialize();
  done();
});

describe('Unique URI generation', () => {
  it('Given access to storage, should generate unique URI', async () => {
    const storage = await UriStorage.findOne();
    const { error, shortURI } = await generateUniqueURI(storage);
    expect(error).toBeFalsy();
    expect(shortURI).toMatch(/^[a-zA-Z0-9]{7}$/);
  });
});
