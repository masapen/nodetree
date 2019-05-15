const app = require('../app');
const express = require('express');
const _ = require('lodash');
const uuid = require('uuid/v4');

const router = express.Router();
const connectedClients = {};
let clientCount = 0;

const handleMessage = (clientInfo, msg) => {
	console.log(msg);
}

const injectHandlers = wsServer => {
	wsServer.once('connection', ws => {
		let personalId = uuid();


		console.log('New connection');
		connectedClients[personalId] = {
			id: personalId,
			socket: ws
		};

		clientCount ++;
		console.log(clientCount);


		ws.on('close', () => {
			console.log(`Client ${personalId} disconnected`);
			_.unset(connectedClients, `[${personalId}]`);
			clientCount --;
		})

		ws.on('message', msg => handleMessage(connectedClients[personalId], msg));

		ws.on('open', () => {
			console.log(`onOpen(${personalId})`);
		});

		const payload = {
			type: 'TREE_STRUCTURE', 
			data: {id: personalId}
		};

		ws.send(JSON.stringify(payload));
	});
};

const broadcast = (data, ...except) => {
	_.forEach(connectedClients, (value, key) => {
		if(!except.includes(value.id)) {
			value.socket.send(data);
		}
	});
}

module.exports = {
	injectHandlers,
	broadcast
	//TODO: Helper functions for other routes.
}