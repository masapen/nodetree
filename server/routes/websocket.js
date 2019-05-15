const app = require('../app');
const express = require('express');
const _ = require('lodash');
const uuid = require('uuid/v4');
const {
	getAll
} = require('../controllers/factory');

const connectedClients = {};
let clientCount = 0;

const sendObj = (socket, obj) => socket.send(JSON.stringify(obj));

const handleMessage = (clientInfo, msg) => {
	const {socket} = clientInfo;
	console.log(msg);

	switch(msg.type) {
		case 'TREE_REQUEST': {
			getAll()
				.then(result => sendObj(socket, {type: 'TREE_STRUCTURE', data: result}));
		}
		default: {
			sendObj(socket, {type: 'UNKNOWN_TYPE', data: 'No idea what you are asking for'});
		}
	}
}

const injectHandlers = wsServer => {
	wsServer.on('connection', ws => {
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

		handleMessage(connectedClients[personalId], {type: 'TREE_REQUEST'});
		//ws.send(JSON.stringify(payload));
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