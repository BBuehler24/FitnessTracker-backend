require('dotenv').config()
const express = require('express')
const cors = require('cors');
const app = express();
const apiRouter = require('./api/index');

// Setup your Middleware and API Router here
app.use(cors()); // cors middleware
app.use(express.json()); // json body middleware

app.use('/api', apiRouter);

module.exports = app;
