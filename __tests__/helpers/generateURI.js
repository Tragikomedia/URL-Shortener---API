const { generateUniqueURI } = require('../../helpers/generateURI');

const db = require('../../config/db');
const uriStorage = require('../../config/uriStorage');
const UriStorage = require('../../models/uriStorage');

beforeAll( async done => {
    await db.connect()
    await uriStorage.initialize();
    done();
});

afterAll(done => {
    db.disconnect();
    done();
});

describe('Unique URI generation', () => {
    it('Given access to storage, should generate unique URI', async () => {
        const storage = await UriStorage.findOne();
        const uri = await generateUniqueURI(storage);
        expect(uri).toMatch(/^[a-z0-9]{7}$/);
    });
});