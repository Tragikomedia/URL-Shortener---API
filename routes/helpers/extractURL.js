const shortUrlRegExp = /[a-zA-Z0-9@:%._\\+~#?&/=]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%._\\+~#?&//=]*)$/
const extractTargetUrl = url => shortUrlRegExp.exec(url)[0];

module.exports = { extractTargetUrl };