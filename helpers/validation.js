const urlRegExp = /^((http|https):\/\/)?(www.)?[a-zA-Z0-9@:%._\\+~#?&/=]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%._\\+~#?&//=]*)$/;
const uriRegExp = /^[a-zA-Z0-9]{7}$/;
const validURL = (url) => urlRegExp.test(url);
const validInternalURI = (uri) => uriRegExp.test(uri);

module.exports = { validURL, validInternalURI };
