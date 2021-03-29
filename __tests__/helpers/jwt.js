require('dotenv').config();
const { signJWT, verifyJWT } = require('../../helpers/jwt');
const User = require('../../models/user');

describe('JWT', () => {
  it('Given a User object, should sign JWT', () => {
    const params = {
      externalId: 'abcde000',
      name: 'Some Body',
      provider: 'Facebook',
    };
    const user = new User(params);
    const token = signJWT(user);
    expect(token).toBeTruthy();
  });
  it('Given a User object, should sign and verify JWT', () => {
    const params = {
      externalId: 'bagarye345',
      name: 'Mario Puzo',
      provider: 'Google',
    };
    const user = new User(params);
    const token = signJWT(user);
    const { id, name, iat, exp } = verifyJWT(token);
    expect(id).toMatch(user.id);
    expect(name).toMatch(user.name);
    expect(exp - iat).toBe(3600);
  });
});
