const { extractData, getLinkData } = require('../../helpers/linkData');
const Click = require('../../models/click');
const Link = require('../../models/link');

describe('getLinkData', () => {
    it('Given a link in default mode, should return brief data', async () => {
        const targetURL = 'example.org';
        const shortURI = 'hello12';
        const link = new Link({
            targetURL,
            shortURI,
            user: 'Charles',
            maxClicks: 10
        });
        const linkData = await getLinkData(link);
        expect(linkData.targetURL).toMatch(targetURL);
        expect(linkData.shortURI).toMatch(shortURI);
        expect(linkData.user).toBeFalsy();
        expect(linkData.maxClicks).toBeFalsy();
    });
});

describe('extractData', () => {
    it('Given an array of links, should return an array of objects containing targetURL and shortURI', async () => {
        const link1 = new Link({targetURL: 'google.com', shortURI: 'babu123'});
        const link2 = new Link({targetURL: 'facebook.com', shortURI: 'bobu123'});
        const link3 = new Link({targetURL: 'example.info', shortURI: 'bjkw321'});
        const links = [link1, link2, link3];
        const linksData = await extractData(links);
        expect(linksData.find(link => link.targetURL === link1.targetURL && link.shortURI === link1.shortURI));
        expect(linksData.find(link => link.targetURL === link2.targetURL && link.shortURI === link2.shortURI));
        expect(linksData.find(link => link.targetURL === link3.targetURL && link.shortURI === link3.shortURI));
    });
})