const router = require('express').Router();
const logger = require('../helpers/logger');
const { validURL } = require('../helpers/validation');
const { attemptAuthetication } = require('../middlewares/auth');
const Link = require('../models/link');

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  schemas:
 *    Link:
 *      type: object
 *      required:
 *        - uri
 *      properties:
 *        uri:
 *          type: string
 *          example: rDf4w21
 *          description: A short uri you can attach to api server's address to use the link e.g. server.com/uri
 *    UserInput:
 *      type: object
 *      required:
 *        -url
 *      properties:
 *        url:
 *          type: string
 *          example: www.github.com
 *          format: uri
 *          description: The link you want to have shortened
 *        options:
 *          type: object
 *          description: Bonus expiration options
 *          properties:
 *            expiresAt:
 *              type: string
 *              format: date
 *              example: 2077-10-23
 *              description: Date before which the link is active
 *            maxClicks:
 *              type: integer
 *              minimum: 1
 *              description: Maximum number of times the link can be clicked before it expires
 *    Error:
 *      type: object
 *      required:
 *        -error
 *      properties:
 *        error:
 *          type: string
 *          description: Error message
 */

// POST /
// @desc Post link you want to have shortened
/**
 * @swagger
 * /:
 *  post:
 *    tags:
 *      - Public API
 *    summary: Post link that you want to shorten
 *    description: Authorization is not obligatory, but adding a valid JWT makes links associated with the user.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserInput'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      201:
 *        description: Returns a uri you can attach to server's address to get redirected to the original link's destination
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Link'
 *      400:
 *        description: Provided link is invalid
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/Error'
 *      500:
 *        description: Server problem
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#components/schemas/Error'
 */
router.post('/', attemptAuthetication, async (req, res) => {
  const { url } = req.body;
  if (!validURL(url)) return res.status(400).json({ error: 'Invalid URL' });
  const { error, link } = await Link.fromReq(req);
  if (error) return res.status(500).json({ error });
  try {
    await link.save();
  } catch (error) {
    return res.status(500).json({ error: `Internal server error: ${error}` });
  }
  res.status(201).json({ uri: link.shortURI });
});

// GET /:id
// @desc Access URI, get redirected to the stored URL
/**
 * @swagger
 * /{id}:
 *   get:
 *     tags:
 *      - Public API
 *     summary: Use uri id you obtained from POST / to get redirected to your desired destination
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Uri id of a link stored in the database
 *     responses:
 *       302:
 *         description: Get redirected to the location specified by link corresponding to the provided uri id
 *       404:
 *         description: The uri doesn't correspond to any link stored in the database
 *         content:
 *          text/html:
 *            schema:
 *              type: string
 *              example: Error - some error text
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { error, link } = await Link.findByUri(id);
  if (error) return res.status(404).render('error.html', { error });
  const url = link.targetURL;
  res.redirect(`https://${url}`);
  // Useful only for stats or click-related expiration
  if (link.user || link.maxClicks) {
    const { error } = await Link.updateStats(req, link);
    if (error) logger.error(`Could not save updated data: ${error}`);
  }
});

module.exports = router;
