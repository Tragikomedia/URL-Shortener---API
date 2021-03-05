const urlRegExp = /^((http|https):\/\/)?(www.)?[a-zA-Z0-9@:%._\\+~#?&/=]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%._\\+~#?&//=]*)$/;
const validURL = (url) => urlRegExp.test(url);

module.exports = { validURL };