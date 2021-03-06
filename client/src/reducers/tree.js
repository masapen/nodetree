/*
  TODO: Create reducer for getAll, edit (rename + updateRange, WIP), regenerate, delete
*/

import {connect, send} from '@giantmachines/redux-websocket';

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

      case 'USER_COUNT': {
        return {
          ...state,
          usersConnected: data
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


export const connectToHost = address => dispatch => dispatch(connect(address));
export const generateChildren = (factoryId, numChildren) => dispatch => 
  dispatch(send({
      type: 'CHILD_GENERATION_REQUEST', 
      data: {uuid: factoryId, numChildren}
    }));

export const createFactory = submissionObj => dispatch =>
  dispatch(send({
    type: 'FACTORY_CREATION_REQUEST',
    data: {
      name: submissionObj.factoryName,
      numChildren: parseInt(submissionObj.numChildren, 10),
      min: parseInt(submissionObj.minValue, 10),
      max: parseInt(submissionObj.maxValue, 10)
    }
  }));

export const deleteFactory = uuid => dispatch => dispatch(send({type: 'FACTORY_DELETION_REQUEST', data: {uuid}}));

export const updateFactory = (uuid, submissionObj) => dispatch =>
  dispatch(send({
    type: 'FACTORY_UPDATE_REQUEST',
    data: {
      uuid,
      name: submissionObj.factoryName,
      numChildren: parseInt(submissionObj.numChildren, 10),
      min: parseInt(submissionObj.minValue, 10),
      max: parseInt(submissionObj.maxValue, 10)
    }
  }));


export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case WS_OPEN: {
      return state;
    }
    case WS_MESSAGE: {
      return messageHandler(state, action);
    }

    default: {
      return state;
    }
  }
}
