const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener',
      description:
        'An API that shrinks your complex urls into short and sweet links',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);
const setup = swaggerUI.setup(specs);
const serve = swaggerUI.serve;

module.exports = {
  serve,
  setup,
};
