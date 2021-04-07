const getLinkData = (link, mode = 'brief') => {
  const data = {};
  data.targetURL = link.targetURL;
  data.shortURI = link.shortURI;
  data.id = link._id;
  if (mode === 'exhaustive') {
    data.expiresAt = link.expiresAt;
    data.maxClicks = link.maxClicks;
    data.clicks = link.clicks;
  }
  return data;
};

const extractData = async (links) => links.map(getLinkData);

module.exports = { extractData, getLinkData };
