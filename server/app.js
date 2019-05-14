const express = require('express');
const app = express();
const wsInstance = require('express-ws')(app);

module.exports = app;