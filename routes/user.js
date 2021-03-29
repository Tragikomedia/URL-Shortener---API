const router = require('express').Router();
const Link = require('../models/link');
const { authenticateUser } = require('../middlewares/auth');
const { extractData, getLinkData } = require('../helpers/linkData');

// GET /user/links/all
// @desc Get all links posted by the user
router.get('/all', authenticateUser, async (req, res) => {
  const links = await Link.findByUserId(req.user?.id);
  const linksData = await extractData(links);
  const message = {
    name: req.user.name,
    linksData,
  };
  res.json(message);
});

// GET /user/links/:id
// @desc Get a particular link posted by user
router.get('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { error, link, status } = await Link.findInUserLinks(req.user, id);
  if (error) return res.status(status).json({ error });
  const linkData = await getLinkData(link, 'exhaustive');
  res.status(200).json({ linkData });
});

// DELETE /user/links/:id
// @desc Delete a particular link posted by user
router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { error, status } = await Link.deleteUserLink(req.user, id);
  if (error) return res.status(status).json({ error });
  res.status(204).end();
});

module.exports = router;
