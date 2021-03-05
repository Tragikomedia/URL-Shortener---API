const { validURL } = require('../../routes/helpers/validation');

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