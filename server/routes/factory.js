
//TODO: Break up route functions, put into separate files.
//TODO: Merge makeChildren and rename into /edit
const express = require('express');
const uuid = require('uuid/v4');
const _ = require('lodash');
const queries = require('../db/queries');
const {broadcast} = require('./websocket');
const {isSafeUUIDForm} = require('../lib/util');

const router = express.Router();
const {
	makeFactory, getEverything, getOne,
	changeName, deleteOne, regenerateChildren
} = queries;


const TODO_RES = {
	ok: false,
	msg: 'Not yet implemented'
};

const sendFullUpdate = data => broadcast(JSON.stringify(data));

const errorMessageLookup = {
	NOTFOUND: 404
};

router.get('/all', (req, res) => {
	return getEverything()
		.then(result => {
			return res.status(200).json({ok: true, data: result});
		})
});

router.post('/create', (req, res) => {
	const givenFields = Object.keys(req.body);

	if(!givenFields.includes('name')) {
		return res.status(400).json({ok: false, msg: 'Factory must have a name'});
	}

	if(req.body.name.length > 64) {
		return res.status(400).json({ok: false, msg: 'Name must be 64 characters or less'});
	}

	const filteredName = _.replace(req.body.name, new RegExp(/\w/, 'g'), '').trim();

	if(filteredName.length > 0) {
		return res.status(400).json({ok: false, msg: `Alphanumeric characters only - Characters ${filteredName} not allowed`});
	}

	const min = parseInt(req.body.minimum || 0, 10);
	const max = parseInt(req.body.maximum || 1, 10);
	const count = parseInt(req.body.numChildren || 0, 10);

	if(!_.isFinite(min)) {
		return res.status(400).json({ok: false, msg: 'Minimum value must be a number'});
	}

	if(!_.isFinite(max)) {
		return res.status(400).json({ok: false, msg: 'Maximum value must be a number'});
	}

	if(!_.isFinite(count)) {
		return res.status(400).json({ok: false, msg: 'Amount of numbers must be a number'});
	}

	if(count > 15) {
		return res.status(400).json({ok: false, msg: 'Cannot generate more than 15 numbers'});
	}

	if(min < 0) {
		return res.status(400).json({ok: false, msg: 'Minimum cannot be less than 0'});
	}

	if(max < 1) {
		return res.status(400).json({ok: false, msg: 'Maximum cannot be less than 1'});
	}

	if(max < min) {
		return res.status(400).json({ok: false, msg: 'Maximum cannot be less than minimum'});
	}

	const newUUID = uuid();

	return makeFactory(req.body.name, newUUID, count, min, max)
		.then(result => {
			//TODO: Return an /all query to refresh list.
			console.log(result);
			//TODO: Send 'update' websocket notice to all connected users
			sendFullUpdate();
			return res.status(200).json({ok: true, msg: 'Factory created'});
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json({ok: false, msg: 'Server error - something went wrong on our end'});
		});
});

router.get('/:uuid', (req, res) => {
	const uuid = req.params.uuid;

	if(!isSafeUUIDForm(uuid)) {
		return res.status(400).json({ok: false, msg: 'Invalid identifier sent'});
	}

	return getOne(uuid)
		.then(result => {
			return res.status(200).json({ok: true, data: result});
		})
		.catch(err => {
			console.error(err);
			const statusCode = errorMessageLookup[err.message] || 500;
			return res.status(statusCode).json({ok: false, msg: `Unable to get factory with ID ${uuid}`});
		});
});

router.patch('/:uuid/rename', (req, res) => {
	const uuid = req.params.uuid;
	const newName = req.body.name;

	if(!isSafeUUIDForm(uuid)) {
		return res.status(400).json({ok: false, msg: 'Invalid identifier sent'});
	}

	if(!newName || newName.length < 1 || newName.trim().length < 1) {
		return res.status(400).json({ok: false, msg: 'New name requires at least one alphanumeric character'});
	}

	if(newName.length > 64) {
		return res.status(400).json({ok: false, msg: 'Name must be 64 characters or less'});
	}

	const filteredName = _.replace(newName, new RegExp(/\w/, 'g'), '').trim();

	if(filteredName.length > 0) {
		return res.status(400).json({ok: false, msg: `Alphanumeric characters only - Characters ${filteredName} not allowed`});
	}

	return changeName(uuid, newName)
		.then(result => {
			sendFullUpdate();
			return res.status(200).json({ok: true, msg: 'Name changed'});
		})
		.catch(err => {
			console.error(err);
			//TODO: Be able to tell the user if it was server error or UUID not found.
			return res.status(500).json({ok: false, msg: 'Unable to change name'});
		});
});

router.post('/:uuid/makeChildren', (req, res) => {
	const uuid = req.params.uuid;

	if(!isSafeUUIDForm(uuid)) {
		return res.status(400).json({ok: false, msg: 'Invalid identifier sent'});
	}

	const count = parseInt(req.body.numChildren || 0, 10);

	if(!_.isFinite(count)) {
		return res.status(400).json({ok: false, msg: 'Amount of numbers must be a number'});
	}

	if(count > 15) {
		return res.status(400).json({ok: false, msg: 'Cannot generate more than 15 numbers'});
	}

	return regenerateChildren(uuid, count)
		.then(result => {
			sendFullUpdate();
			return res.status(200).json({ok: true, msg: 'Children generated'});
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json({ok: false, msg: 'Unable to generate new children'});
		});
});

router.delete('/:uuid', (req, res) => {
	const uuid = req.params.uuid;
	const newName = req.body.name;

	if(!isSafeUUIDForm(uuid)) {
		return res.status(400).json({ok: false, msg: 'Invalid identifier sent'});
	}

	return deleteOne(uuid)
		.then(result => {
			sendFullUpdate();
			return res.status(200).json({ok: true, msg: 'Factory deleted'});
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json({ok: false, msg: 'Unable to delete factory'});
		});
});

router.use((req, res, next) => res.status(404).json({ok: false, msg: 'Not found'}));

module.exports = router;