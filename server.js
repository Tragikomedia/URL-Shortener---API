const express = require('express');
const app = express();

// View engine used for 3rd party auth
const mustacheExpress = require('mustache-express');
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

//Api-docs
const swagger = require('./config/swagger');
app.use('/api-docs', swagger.serve, swagger.setup);

// Middlewares
const helmet = require('helmet');
const cors = require('cors');
const passport = require('./config/passport');
const methodOverride = require('method-override');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(methodOverride('_method'));

// Routes
const apiRouter = require('./routes');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
app.use('/auth', authRouter);
app.use('/user/links', userRouter);
app.use('/', apiRouter);

//Last resort error handling
const { errorHandler } = require('./middlewares/errorHandling');
app.use(errorHandler);

module.exports = app;
