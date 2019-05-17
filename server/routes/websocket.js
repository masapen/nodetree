const app = require('../app');
const express = require('express');
const _ = require('lodash');
const uuid = require('uuid/v4');
const {
	getAll, generate, changeRange
} = require('../controllers/factory');

const connectedClients = {};
let clientCount = 0;

const sendObj = (socket, obj) => {
	//console.log('socket <- ', JSON.stringify(obj));
	socket.send(JSON.stringify(obj))
};

const sendFullUpdate = data => {
	_.forEach(connectedClients, (value, key) => {
		sendObj(value.socket, data);
	});
}

const broadcastTree = () => getAll().then(res => sendFullUpdate({type: 'TREE_STRUCTURE', data: res}));

const handleMessage = (clientInfo, msg) => {
	const {socket} = clientInfo;
	console.log(msg);

	switch(msg.type) {
		case 'TREE_REQUEST': {
			return getAll()
				.then(result => sendObj(socket, {type: 'TREE_STRUCTURE', data: result}));
		}

		case 'CHILD_GENERATION_REQUEST': {
			const {uuid, numChildren} = msg.data;
			if(!uuid) {
				sendObj(socket, {type: 'ERROR', data: 'ID of factory required'});
			}

			if(!numChildren) {
				sendObj(socket, {type: 'ERROR', data: 'Number of desired numbers required'});
			}

			return generate({uuid, numChildren})
				.then(result => broadcastTree());
		}

		case 'RANGE_CHANGE_REQUEST': {
			const {uuid, min, max} = msg.data;
			if(!uuid) {
				sendObj(socket, {type: 'ERROR', data: 'ID of factory required'});
			}

			if(!min) {
				sendObj(socket, {type: 'ERROR', data: 'Minimum value required'});
			}

			if(!max) {
				sendObj(socket, {type: 'ERROR', data: 'Maximum value required'});
			}

			return changeRange(uuid, min, max)
				.then(result => broadcastTree());
		}
		
		default: {
			sendObj(socket, {type: 'UNKNOWN_TYPE', data: 'No idea what you are asking for'});
		}
	}
}

const injectHandlers = wsServer => {
	wsServer.on('connection', (ws, req) => {
		let personalId = uuid();


		console.log(`New connection from ${req.connection.remoteAddress}`);
		connectedClients[personalId] = {
			id: personalId,
			socket: ws
		};

		clientCount ++;

		ws.on('close', () => {
			console.log(`Client ${personalId} disconnected`);
			_.unset(connectedClients, `[${personalId}]`);
			clientCount --;
			sendFullUpdate({type: 'USER_COUNT', data: clientCount});
		})

		ws.on('message', msg => {
			try {
				const message = JSON.parse(msg);
				handleMessage(connectedClients[personalId], message);
			} catch(err) {
				console.error(err);
				sendObj(ws, {type: 'ERROR', data: 'Invalid message sent'});
			}
		});

		ws.on('open', () => {
			console.log(`onOpen(${personalId})`);
		});

		const payload = {
			type: 'TREE_STRUCTURE', 
			data: {id: personalId}
		};

		handleMessage(connectedClients[personalId], {type: 'TREE_REQUEST'});
	});
};

module.exports = {
	injectHandlers
}