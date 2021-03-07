const express = require('express');
const app = express();

// View engine used for 3rd party auth
const mustacheExpress = require('mustache-express');
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/public');

// Middlewares
const cors = require('cors');
const passport = require('./config/passport');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(passport.initialize());

// Routes
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/', apiRouter);

module.exports = app;