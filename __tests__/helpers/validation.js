const { validURL, validInternalURI } = require('../../routes/helpers/validation');

describe('URL Validation - invalid', () => {
    it('Given url with space, should equal false', () => {
        const invalid = 'http www.ugabuga.com';
        expect(validURL(invalid)).toBe(false);
    });
    it('Given url with no domain, should equal false', () => {
        const invalid = 'kumbaja';
        expect(validURL(invalid)).toBe(false);
    });
    it('Given url with fully numeric domain, should equal false', () => {
        const invalid = 'kilimandzaro.44';
        expect(validURL(invalid)).toBe(false);
    });
});

describe('URL Validation - valid', () => {
    it('Given full regular url, should equal true', () => {
        const valid = "https://www.buka.pl";
        expect(validURL(valid)).toBe(true);
    });
    it('Given full url with additional path, should equal true', () => {
        const valid = "https://jestjs.io/docs/en/expect.html";
        expect(validURL(valid)).toBe(true);
    });
    it('Given short url, should equal true', () => {
        const valid = "facebook.com";
        expect(validURL(valid)).toBe(true);
    });
    it('Given short url with www, should equal true', () => {
        const valid = "www.pancernik.info";
        expect(validURL(valid)).toBe(true);
    });
    it('Given short url with additional path, should equal true', () => {
        const valid = "reddit.com/r/NintendoSwitch/";
        expect(validURL(valid)).toBe(true);
    });
});

describe('URI validation', () => {
    it('Given a valid URI, should return true', () => {
        const uri = 'm7rr3ta';
        expect(validInternalURI(uri)).toBe(true);
    });
    it('Given too short URI, should return false', () => {
        const uri = 'ab8';
        expect(validInternalURI(uri)).toBe(false);
    });
    it('Given too long URI, should return false', () => {
        const uri = 'm7rr3tab';
        expect(validInternalURI(uri)).toBe(false);
    });
    it('Given URI with illegal symbols, should return false', () => {
        const uri = 'm7%r3ta';
        expect(validInternalURI(uri)).toBe(false);
    });
});