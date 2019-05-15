
//TODO: Break up route functions, put into separate files.
//TODO: Merge makeChildren and rename into /edit
const express = require('express');
const uuid = require('uuid/v4');
const _ = require('lodash');
const queries = require('../db/queries');
const {broadcast} = require('../routes/websocket');
const {isSafeUUIDForm} = require('../lib/util');

const router = express.Router();
const {
	makeFactory, getEverything, getOne,
	changeName, deleteOne, regenerateChildren
} = queries;


const TODO_RES = {
	type: 'ERROR',
	msg: 'Not yet implemented'
};

const sendFullUpdate = data => broadcast(JSON.stringify(data));

const errorMessageLookup = {
	NOTFOUND: 404
};

const getAll = async () => await getEverything();

const create = body => {
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

	const min = parseInt(body.minimum || 0, 10);
	const max = parseInt(body.maximum || 1, 10);
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

	const newUUID = uuid();

	return makeFactory(body.name, newUUID, count, min, max)
		.then(result => {
			//TODO: Return an /all query to refresh list.
			console.log(result);
			//TODO: Send 'update' websocket notice to all connected users
			sendFullUpdate();
			return Promise.resolve({ok: true, msg: 'Factory created'});
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

//TODO: Turn this into general EDIT function
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
			sendFullUpdate();
			return Promise.resolve({ok: true, msg: 'Name changed'});
		})
		.catch(err => {
			console.error(err);
			//TODO: Be able to tell the user if it was server error or UUID not found.
			return Promise.resolve({type: 'ERROR', msg: 'Unable to change name'});
		});
}

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
			sendFullUpdate();
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
			sendFullUpdate();
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
	rename,
	generate
}