require('dotenv').config();
const app = require('./app');
const http = require('http');
const websocket = require('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const factoryRoutes = require('./routes/factory');
const {injectHandlers} = require('./routes/websocket');

const server = http.createServer(app);
const ws = new websocket.Server({
	server,
	path: '/live/connect'
});

injectHandlers(ws);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'localhost:3001, d3mw298potvk6s.cloudfront.net');
	req.ws = ws;
	next();
});

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

server.listen(3000, () => console.log('Listening'));