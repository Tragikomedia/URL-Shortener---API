const shortUrlRegExp = /^((http|https):\/\/)?(www.)?(.*)$/;
const extractTargetUrl = (url) => shortUrlRegExp.exec(url)[4];

module.exports = { extractTargetUrl };
