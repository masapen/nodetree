import {applyMiddleware, createStore} from 'redux';
import reactWS from '@giantmachines/redux-websocket';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import {reducer as TreeReducer} from 'reducers/tree';
//TODO: Make reducers

const wsMiddleware = reactWS();

const store = createStore(
	TreeReducer,
	applyMiddleware(wsMiddleware, logger, thunk)
);

export default store;

