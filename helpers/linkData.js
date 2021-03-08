const Click = require('../models/click');

const getClickData = async clickId => {
    const click = await Click.findById(clickId);
    if (!click) return {error: 'Click data inaccessible'};
    return {
        time: click.time,
        referer: click.referer,
        ip: click.ip
    };
}

const getLinkData = async (link, mode = 'brief') => {
    const data = {};
    data.targetURL = link.targetURL;
    data.shortURI = link.shortURI;
    if (mode === 'exhaustive') {
        data.expiresAt = link.expiresAt;
        data.maxClicks = link.maxClicks;
        data.clicks = await Promise.all(link.clicks.map(getClickData));
    }
    return data;
};

// Without Promise.all parseLinks and other async maps return an array of promises
const extractData = async links => await Promise.all(links.map(getLinkData));

module.exports = { extractData, getLinkData };