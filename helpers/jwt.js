const jwt = require('jsonwebtoken');

const signJWT = (user) =>
  jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
const verifyJWT = (token) => jwt.verify(token, process.env.JWT_SECRET);
const passTokenToClient = (req, res) => {
  const token = signJWT(req.user);
  // Render a view where script passes the token to client via postMessage
  res.render('auth.html', { token });
};

module.exports = { signJWT, verifyJWT, passTokenToClient };
