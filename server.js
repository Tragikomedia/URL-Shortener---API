const express = require('express');
const app = express();

// View engine used for 3rd party auth
const mustacheExpress = require('mustache-express');
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Middlewares
const cors = require('cors');
const passport = require('./config/passport');
const methodOverride = require('method-override');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(methodOverride('_method'));

// Routes
const apiRouter = require('./routes');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
app.use('/auth', authRouter);
app.use('/user/links', userRouter);
app.use('/', apiRouter);

module.exports = app;