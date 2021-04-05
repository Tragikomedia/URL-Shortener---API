const router = require('express').Router();
const Link = require('../models/link');
const { authenticateUser } = require('../middlewares/auth');
const { extractData, getLinkData } = require('../helpers/linkData');

// GET /user/links/
// @desc Get all links posted by the user
/**
 * @swagger
 * /user/links/:
 *   get:
 *     tags:
 *      - User's links
 *     summary: Get all links posted by the authenticated user
 *     description: Attach JWT to request to obtain all the links that a particular user posted
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *          description: Receive all the links posted by the user and their name
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    description: Username
 *                    example: McExamplington
 *                  linksData:
 *                    type: array
 *                    description: List of all links
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: string
 *                          description: Link's internal id
 *                          example: 6044cb094f66052977397381
 *                        shortURI:
 *                          type: string
 *                          description: Seven characters long identifier used to access the desired link
 *                          example: aj3wR9b
 *                        targetURL:
 *                          type: string
 *                          description: Link to the website user wants others to access when using the shorter one
 *                          example: www.google.com
 *                    
 *       401:
 *         description: Unauthorized - you must provide a valid JWT corresponding to an existing user
 *       500:
 *         description: Internal server error
 *         content:
 *          application/json:
 *           schema:
 *            $ref: '#components/schemas/Error'
 */
router.get('/', authenticateUser, async (req, res) => {
  const links = await Link.findByUserId(req.user?.id);
  const linksData = await extractData(links);
  const message = {
    name: req.user.name,
    linksData,
  };
  res.status(200).json(message);
});

// GET /user/links/:id
// @desc Get a particular link posted by user
/**
 * @swagger
 * /user/links/{id}:
 *   get:
 *     tags:
 *      - User's links
 *     summary: Get info about a particular link posted by the user
 *     description: Attach JWT to request to obtain info about a link that a particular user posted
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        required: true
 *        description: Uri id of a link stored in the database
 *     responses:
 *       200:
 *          description: Receive info about the link
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  linkData:
 *                    type: object
 *                    description: Data connected to the given link
 *                    properties:
 *                      id:
 *                        type: string
 *                        description: Link's internal id
 *                        example: 6044cb094f66052977397381
 *                      shortURI:
 *                        type: string
 *                        description: Seven characters long identifier used to access the desired link
 *                        example: aj3wR9b
 *                      targetURL:
 *                        type: string
 *                        description: Link to the website user wants others to access when using the shorter one
 *                        example: www.google.com
 *                      expiresAt:
 *                        type: string
 *                        nullable: true
 *                        format: date
 *                        example: 2077-10-23
 *                        description: Date before which the link is active
 *                      maxClicks:
 *                        type: integer
 *                        nullable: true
 *                        example: 69
 *                        description: Maximum number of times the link can be clicked before it expires
 *                      clicks:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            time: 
 *                              type: string
 *                              format: date
 *                              example: 2021-03-16T15:26:41.259Z
 *                              description: Timestamp marking the moment the link was clicked
 *                            referer:
 *                              type: string
 *                              nullable: true
 *                              example: www.example.com
 *                              description: Address of the website which the request originated from
 *                            ip:
 *                              type: string
 *                              example: 192.0.0.64
 *                              description: IP address from which the request was made
 *       400:
 *         description: Something went wrong - either user id or uri must be malformatted        
 *       401:
 *         description: Unauthorized - you must provide a valid JWT corresponding to an existing user
 *       404:
 *         description: Such link does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *          application/json:
 *           schema:
 *            $ref: '#components/schemas/Error'
 */
router.get('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { error, link, status } = await Link.findInUserLinks(req.user, id);
  if (error) return res.status(status).json({ error });
  const linkData = await getLinkData(link, 'exhaustive');
  res.status(200).json({ linkData });
});

// DELETE /user/links/:id
// @desc Delete a particular link posted by user
/**
 * @swagger
 * /user/links/{id}:
 *  delete:
 *     tags:
 *      - User's links
 *     summary: Delete particular link posted by the user
 *     description: Attach JWT to be able to delete a link that a particular user posted
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        required: true
 *        description: Uri id of a link stored in the database
 *     responses:
 *       204:
 *        description: Link does not exist in the database any longer
 *       400:
 *         description: Something went wrong - either user id or uri must be malformatted        
 *       401:
 *         description: Unauthorized - you must provide a valid JWT corresponding to an existing user
 *       500:
 *         description: Internal server error
 *         content:
 *          application/json:
 *           schema:
 *            $ref: '#components/schemas/Error'
 *        
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { error, status } = await Link.deleteUserLink(req.user, id);
  if (error) return res.status(status).json({ error });
  res.status(204).end();
});

module.exports = router;
