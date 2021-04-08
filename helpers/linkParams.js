const { getUri } = require('../helpers/generateURI');
const { extractTargetUrl } = require('../helpers/extractURL');

const allAreUndefined = (arr) => arr.every((el) => typeof el === 'undefined');

const validateParams = ({ expired, expiresAt, maxClicks }) => {
  const error = { error: 'Invalid parameters' };
  if (allAreUndefined([expired, expiresAt, maxClicks])) return error;
  if (expired && typeof expired !== 'boolean') return error;
  if (maxClicks && !(typeof maxClicks === 'number' && maxClicks > 0))
    return error;
  if (expiresAt && isNaN(new Date(expiresAt))) return error;
};

const removeEmptyPairs = (obj) => {
  const cleanObj = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] !== 'undefined') cleanObj[key] = obj[key];
  });
  return cleanObj;
};

async function getLinkParams(req) {
  const { error, shortURI } = await getUri();
  if (error) return { error: 'Unique ID could not have been generated.' };
  const { url, options } = req.body;
  let params = {};
  if (options) {
    const err = validateParams(options);
    if (err) return err;
    params = { ...params, ...removeEmptyPairs(options) };
  }
  params.shortURI = shortURI;
  params.targetURL = extractTargetUrl(url);
  if (req.user) params.user = req.user.id;
  return { params };
}

function getUpdateParams(req) {
  const { expired, expiresAt, maxClicks } = req.body;
  const updateObj = removeEmptyPairs({ expired, expiresAt, maxClicks });
  const error = validateParams(updateObj);
  return { updateObj, error };
}

module.exports = { getLinkParams, getUpdateParams };
