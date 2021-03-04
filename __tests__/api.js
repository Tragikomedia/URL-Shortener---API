const supertest = require('supertest');
const app = require('../server');
const request = require('supertest')(app);

describe('GET /api', () => {
    it('Make request', async done => {
        const res = await request.get('/api');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Hello there');
        done();
    });
});

describe('POST /api', () => {
    it('Post name', async done => {
        const name = 'Boromir';
        const res = await request.post('/api').set('Content-Type', 'application/json').send({name});
        expect(res.status).toBe(200);
        expect(res.text).toBe(name);
        done();
    })
});