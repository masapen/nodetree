require('dotenv').config();
const app = require('./app');
const https = require('https');
const fs = require('fs');
const websocket = require('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {injectHandlers} = require('./routes/websocket');

const server = https.createServer({
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
}, app);

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