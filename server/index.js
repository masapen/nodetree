const https = require('https');
const fs = require('fs');
const websocket = require('ws');
const {injectHandlers} = require('./routes/websocket');

const curVersion = fs.readFileSync('./VERSION', 'utf8').trim();
const server = https.createServer({
	key: fs.readFileSync(`./privkey.pem`, 'utf8'),
	cert: fs.readFileSync(`./fullchain.pem`, 'utf8')
});

const ws = new websocket.Server({
	server,
	path: '/live/connect'
});

injectHandlers(ws);

server.listen(3000, () => console.log(`${curVersion} - Listening`));