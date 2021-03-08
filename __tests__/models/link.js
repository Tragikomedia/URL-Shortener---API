const Link = require('../../models/link');
const Click = require('../../models/click');

describe('Link - isExpired', () => {
    it('Given a link that can still be clicked more times, should return false', () => {
        const link = new Link({
            targetURL: 'ugabuga.com',
            shortURI: 'aaaaaaa',
            maxClicks: 10,
        });
        expect(link.isExpired()).toBeFalsy();
    });
    it('Given a link that cannot be clicked more times, should return true', () => {
        const link = new Link({
            targetURL: 'ugabuga.com',
            shortURI: 'aaaaaaa',
            maxClicks: 1,
        });
        link.clicks.push(new Click());
        link.clicks.push(new Click());
        expect(link.isExpired()).toBeTruthy();
    });
    it('Given a link whose expiration time has already come, should return true', () => {
        const link = new Link({
            targetURL: 'ugabuga.com',
            shortURI: 'aaaaaaa',
            expiresAt: new Date('2000', '12', '10')
        });
        expect(link.isExpired()).toBeTruthy();
    });
    it('Given a link whose expiration time has yet to come, should return false', () => {
        const link = new Link({
            targetURL: 'ugabuga.com',
            shortURI: 'aaaaaaa',
            expiresAt: new Date('2037', '12', '10')
        });
        expect(link.isExpired()).toBeFalsy();
    });
    it('Given link with no expiration conditions, should return false', () => {
        const link = new Link({
            targetURL: 'ugabuga.com',
            shortURI: 'aaaaaaa',
        });
        expect(link.isExpired()).toBeFalsy();
    });
});