/*
	TODO: Create reducer for getAll, edit (rename + updateRange, WIP), regenerate, delete
*/

import {connect, send} from '@giantmachines/redux-websocket';

const CONNECTED = 'node-tree/socket/CONNECT';
const DISCONNECTED = 'node-tree/socket/DISCONNECTED';
const GET_ALL = 'node-tree/tree/GET_ALL';
const EDIT = 'node-tree/tree/EDIT';
const REGEN = 'node-tree/tree/REGEN';
const DELETE = 'node-tree/tree/DELETE';

const WS_MESSAGE = 'REDUX_WEBSOCKET::MESSAGE';
const WS_CONNECT = 'REDUX_WEBSOCKET::WEBSOCKET_CONNECT';
const WS_SEND = 'REDUX_WEBSOCKET::WEBSOCKET_SEND';
const WS_OPEN = 'REDUX_WEBSOCKET::OPEN';
const WS_INCOMING = 'REDUX_WEBSOCKET::MESSAGE';

const initialState = {
	tree: [],
};

const messageHandler = (state, action) => {
	const {message, origin} = action.payload;
	try {
		const {type, data} = JSON.parse(message);
		switch(type) {
			case 'GREETING': {
				return {
					...state,
					welcomeMessage: data
				};
			}

			case 'TREE_STRUCTURE': {
				return {
					...state,
					tree: data
				};
			}
			
			default: {
				return state;
			}
		}
	} catch(e) {
		return {
			...state,
			error: 'Invalid message'
		};
	}
}

export const reducer = (state = initialState, action) => {
	switch(action.type) {
		case WS_MESSAGE: {
			return messageHandler(state, action);
		}

		default: {
			return state;
		}
	}
}

const onConnected = data => ({type: CONNECTED, payload: data});
const onGetTree = obj => ({type: GET_ALL, payload: obj});

export const connectToHost = address => dispatch => dispatch(connect(address));
