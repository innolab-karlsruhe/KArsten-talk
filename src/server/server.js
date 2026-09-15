const jsdom = require('jsdom');
const bodyParser = require('body-parser');

const server = require('./start-server');

const app = server.startServer({port: 8000});