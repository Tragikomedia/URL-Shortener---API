const express = require('express');
const app = express();

// Middlewares
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Routes
const apiRouter = require('./routes/index');
app.use('/', apiRouter);

module.exports = app;