const jwt = require('jsonwebtoken');

const signJWT = user => jwt.sign({id: user.id, name: user.name}, process.env.JWT_SECRET, { expiresIn: '1h'});
const verifyJWT = token => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signJWT, verifyJWT };