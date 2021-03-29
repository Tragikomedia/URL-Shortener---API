const { getUri } = require('../helpers/generateURI');
const { extractTargetUrl } = require('../helpers/extractURL');

async function getLinkParams(req) {
  const { error, shortURI } = await getUri();
  if (error) return { error: 'Unique ID could not have been generated.' };
  const { url, options } = req.body;
  const params = {};
  params.shortURI = shortURI;
  params.targetURL = extractTargetUrl(url);
  if (options?.maxClicks) params.maxClicks = options.maxClicks;
  if (options?.expiresAt) params.expiresAt = options.expiresAt;
  if (req.user) params.user = req.user.id;
  return { params };
}

module.exports = { getLinkParams };
