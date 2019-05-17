import {applyMiddleware, createStore} from 'redux';
import reactWS from '@giantmachines/redux-websocket';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import {reducer as TreeReducer} from 'reducers/tree';
//TODO: Make reducers

const wsMiddleware = reactWS();
const isProduction = !window.location.hostname.startsWith('localhost');
const middleware = [wsMiddleware, thunk, !isProduction && logger].filter(mw => !!mw);

const store = createStore(
	TreeReducer,
	applyMiddleware(...middleware)
);

export default store;

