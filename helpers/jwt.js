const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signJWT = (user) =>
  jwt.sign({ id: user.id, name: user.name }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
const verifyJWT = (token) => jwt.verify(token, env.JWT_SECRET);
const passTokenToClient = (req, res) => {
  const token = signJWT(req.user);
  // Render a view where script passes the token to client via postMessage
  res.render('auth.html', { token });
};

module.exports = { signJWT, verifyJWT, passTokenToClient };
