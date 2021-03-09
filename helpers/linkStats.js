const Click = require('../models/click');

async function updateLinkStats(req, link) {
    const click = Click.fromReq(req);
    link.clicks.push(click.id);
    try {
        // Link has priority - important for expiration purposes
        await link.save();
        await click.save();
    } catch(error) {
        return {error};
    }
    return {};
}

module.exports = { updateLinkStats };