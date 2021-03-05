const { extractTargetUrl } = require('../../routes/helpers/extractURL');

describe('Extract target url from proper input', () => {
    it('Given an already short target url, should return it', () => {
        const url = 'wykop.pl/mikroblog/'
        const targetUrl = extractTargetUrl(url);
        expect(targetUrl).toMatch(url);
    });
    it('Given a url starting with www, should remove it', () => {
        const url = 'www.pancernik.info';
        const targetUrl = extractTargetUrl(url);
        expect(targetUrl).toMatch('pancernik.info');
    });
    it('Given a url starting with https, should remove it', () => {
        const url = 'https://expressjs.com/';
        const targetUrl = extractTargetUrl(url);
        expect(targetUrl).toMatch('expressjs.com');
    });
    it('Given a full url, should return short version', () => {
        const url = 'https://www.wykop.pl/wpis/55931437/';
        const targetUrl = extractTargetUrl(url);
        expect(targetUrl).toMatch('wykop.pl/wpis/55931437/');
    });
});