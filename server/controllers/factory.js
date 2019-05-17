
//TODO: Break up route functions, put into separate files.
//TODO: Merge makeChildren and rename into /edit
const uuid = require('uuid/v4');
const _ = require('lodash');
const queries = require('../db/queries');
const {injectHandlers, broadcast} = require('../routes/websocket');
const {isSafeUUIDForm} = require('../lib/util');

const {
  makeFactory, getEverything, getOne,
  changeName, deleteOne, regenerateChildren,
  adjustRanges, updateFactory
} = queries;


const TODO_RES = {
  type: 'ERROR',
  msg: 'Not yet implemented'
};

const errorMessageLookup = {
  NOTFOUND: 404
};

const getAll = async () => {
  return await getEverything();
} 

const create = body => {
  //Now a create or update method.
  const givenFields = Object.keys(body);

  if(!givenFields.includes('name')) {
    return Promise.resolve({type: 'ERROR', msg: 'Factory must have a name'});
  }

  if(body.name.length > 64) {
    return Promise.resolve({type: 'ERROR', msg: 'Name must be 64 characters or less'});
  }

  const filteredName = _.replace(body.name, new RegExp(/\w/, 'g'), '').trim();

  if(filteredName.length > 0) {
    return Promise.resolve({type: 'ERROR', msg: `Alphanumeric characters only - Characters ${filteredName} not allowed`});
  }

  const min = parseInt(body.minimum, 10);
  const max = parseInt(body.maximum, 10);
  const count = parseInt(body.numChildren || 0, 10);

  if(!_.isFinite(min)) {
    return Promise.resolve({type: 'ERROR', msg: 'Minimum value must be a number'});
  }

  if(!_.isFinite(max)) {
    return Promise.resolve({type: 'ERROR', msg: 'Maximum value must be a number'});
  }

  if(!_.isFinite(count)) {
    return Promise.resolve({type: 'ERROR', msg: 'Amount of numbers must be a number'});
  }

  if(count > 15) {
    return Promise.resolve({type: 'ERROR', msg: 'Cannot generate more than 15 numbers'});
  }

  if(min < 0) {
    return Promise.resolve({type: 'ERROR', msg: 'Minimum cannot be less than 0'});
  }

  if(max < 1) {
    return Promise.resolve({type: 'ERROR', msg: 'Maximum cannot be less than 1'});
  }

  if(max < min) {
    return Promise.resolve({type: 'ERROR', msg: 'Maximum cannot be less than minimum'});
  }

  const existingUUID = body.uuid;

  if(existingUUID && !isSafeUUIDForm(existingUUID)) {
    return Promise.resolve({type: 'ERROR', msg: 'Invalid identifier sent'});
  }

  const newUUID = body.uuid ? body.uuid : uuid();
  const factoryMethod = body.uuid ? updateFactory : makeFactory;

  return factoryMethod(body.name, newUUID, count, min, max)
    .then(result => {
      const successMsg = body.uuid ? 'Factory updated' : 'Factory created';
      return Promise.resolve({ok: true, msg: successMsg});
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve({type: 'ERROR', msg: 'Server error - something went wrong on our end'});
    });
}

const get = body => {
  const uuid = body.uuid;

  if(!isSafeUUIDForm(uuid)) {
    return Promise.resolve({type: 'ERROR', msg: 'Invalid identifier sent'});
  }

  return getOne(uuid)
    .then(result => {
      return Promise.resolve({ok: true, data: result});
    })
    .catch(err => {
      return Promise.resolve({type: 'ERROR', msg: `Unable to get factory with ID ${uuid}`});
    });
}

/*
const changeRange = body => {
  const uuid = body.uuid;
  const requestedMin = body.min;
  const requestedMax = body.max;

  if(!isSafeUUIDForm(uuid)) {
    return Promise.resolve({type: 'ERROR', msg: 'Invalid identifier sent'});
  }

  const min = parseInt(requestedMin, 10);
  const max = parseInt(requestedMax, 10);

  if(min < 0) {
    return Promise.resolve({type: 'ERROR', msg: 'Minimum cannot be less than 0'});
  }

  if(max < 1) {
    return Promise.resolve({type: 'ERROR', msg: 'Maximum cannot be less than 1'});
  }

  if(max < min) {
    return Promise.resolve({type: 'ERROR', msg: 'Maximum cannot be less than minimum'});
  }

  return adjustRanges(uuid, min, max)
    .then(result => {
      return Promise.resolve({ok: true, msg: 'Range updated'});
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve({type: 'ERROR', msg: 'Unable to change range'});
    });
}

const rename = body => {
  const uuid = body.uuid;
  const newName = body.name;

  if(!isSafeUUIDForm(uuid)) {
    return Promise.resolve({type: 'ERROR', msg: 'Invalid identifier sent'});
  }

  if(!newName || newName.length < 1 || newName.trim().length < 1) {
    return Promise.resolve({type: 'ERROR', msg: 'New name requires at least one alphanumeric character'});
  }

  if(newName.length > 64) {
    return Promise.resolve({type: 'ERROR', msg: 'Name must be 64 characters or less'});
  }

  const filteredName = _.replace(newName, new RegExp(/\w/, 'g'), '').trim();

  if(filteredName.length > 0) {
    return Promise.resolve({type: 'ERROR', msg: `Alphanumeric characters only - Characters ${filteredName} not allowed`});
  }

  return changeName(uuid, newName)
    .then(result => {
      return Promise.resolve({ok: true, msg: 'Name changed'});
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve({type: 'ERROR', msg: 'Unable to change name'});
    });
}
*/
const generate = body => {
  const uuid = body.uuid;

  if(!isSafeUUIDForm(uuid)) {
    return Promise.resolve({type: 'ERROR', msg: 'Invalid identifier sent'});
  }

  const count = parseInt(body.numChildren || 0, 10);

  if(!_.isFinite(count)) {
    return Promise.resolve({type: 'ERROR', msg: 'Amount of numbers must be a number'});
  }

  if(count > 15) {
    return Promise.resolve({type: 'ERROR', msg: 'Cannot generate more than 15 numbers'});
  }

  return regenerateChildren(uuid, count)
    .then(result => {
      return Promise.resolve({ok: true, msg: 'Children generated'});
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve({type: 'ERROR', msg: 'Unable to generate new children'});
    });
}

const selfdestruct = body => {
  const uuid = body.uuid;
  const newName = body.name;

  if(!isSafeUUIDForm(uuid)) {
    return Promise.resolve({type: 'ERROR', msg: 'Invalid identifier sent'});
  }

  return deleteOne(uuid)
    .then(result => {
      return Promise.resolve({ok: true, msg: 'Factory deleted'});
    })
    .catch(err => {
      console.error(err);
      return Promise.resolve({type: 'ERROR', msg: 'Unable to delete factory'});
    });
}

module.exports = {
  getAll,
  get,
  create,
  selfdestruct,
  generate
}