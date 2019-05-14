const app = require('../app');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

const connectedClients = {};

router.ws('/connect', (ws, req) => {
	let personalId = req.body.id || null;

	ws.on('open', () => {
		personalId = personalId || connectedClients.length;
		connectedClients[personalId] = {
			id: personalId,
			socket: ws,
			lastHeartbeat: Date.now()
		};
	})

	ws.on('close', () => {
		_.unset(connectedClients, `[${personalId}]`);
	})
});

const broadcast = data => {
	_.forEach(connectedClients, (value, key) => {
		value.socket.send(data);
	});
}

module.exports = {
	router,
	broadcast
	//TODO: Helper functions for other routes.
}