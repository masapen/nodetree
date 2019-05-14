
//TODO: Base factory route
/*
TODO:
Factory::rename
Factory::generateChildren
Factory::delete
*/

const express = require('express');
const uuid = require('uuid/v4');
const _ = require('lodash');
const queries = require('../db/queries');
const {broadcast} = require('./websocket');
const {isSafeUUIDForm} = require('../lib/util');

const router = express.Router();
const {
	makeFactory, getEverything, getOne
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

	if(req.body.minimum && !parseInt(req.body.minimum, 10)) {
		return res.status(400).json({ok: false, msg: 'Minimum value must be a number'});
	}

	if(req.body.maximum && !parseInt(req.body.maximum, 10)) {
		return res.status(400).json({ok: false, msg: 'Maximum value must be a number'});
	}

	if(req.body.numChildren && !parseInt(req.body.numChildren, 10)) {
		return res.status(400).json({ok: false, msg: 'Amount of numbers must be a number'});
	}

	const newUUID = uuid();

	return makeFactory(req.body.name, newUUID, req.body.numChildren || 0, req.body.minimum || 0, req.body.maximum || 1)
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

	//return res.status(501).json(TODO_RES);
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

	if(!isSafeUUIDForm(uuid)) {
		return res.status(400).json({ok: false, msg: 'Invalid identifier sent'});
	}

	//TODO: Rename
	return res.status(501).json(TODO_RES);
});

router.post('/:uuid/makeChildren', (req, res) => {
	return res.status(501).json(TODO_RES);
});

router.delete('/:uuid', (req, res) => {
	return res.status(501).json(TODO_RES);
});

router.use((req, res, next) => res.status(404).json({ok: false, msg: 'Not found'}));

module.exports = router;