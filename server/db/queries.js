const query = require('./query');
const { 
	random, range, isNil,
	isNumber 
} = require('lodash');

const deleteOne = async uuid => {
	//Triggers on the DB will handle deletion of children before the factory.
	const deleteFactoryQuery = {
		text: 'DELETE FROM factories WHERE uuid = $1',
		values: [uuid]
	};

	try {
		const deletionResult = await query(deleteFactoryQuery);
		return true;
	} catch(err) {
		throw err;
	}
}

const regenerateChildren = async (uuid, numChildren) => {
	const findFactoryQuery = {
		text: 'SELECT id, min, max FROM factories WHERE uuid = $1',
		values: [uuid]
	};

	try {
		const findFactoryResult = await query(findFactoryQuery);
		const {id, min, max} = findFactoryResult.rows[0];

		const cleanHouseQuery = {
			text: 'DELETE FROM children WHERE fid = $1',
			values: [id]
		};

		const cleanHouseResult = await query(cleanHouseQuery);

		const numSequence = range(0, numChildren).map(n => random(min, max));
		const sequenceQuery = numSequence.map(num => `(${id},${num})`).join(',');

		const newChildrenQuery = {
			text: `INSERT INTO children(fid, num) VALUES ${sequenceQuery} RETURNING *`,
			values: []
		};

		const newChildrenResult = await query(newChildrenQuery);
		return true;
	} catch(err) {
		throw err;
	}
}

const adjustRanges = async (uuid, newMin, newMax) => {
	const newRangeQuery = {
		text: 'UPDATE factories SET min = $1, max = $2 WHERE uuid = $3',
		values: [newMin, newMax, uuid]
	};

	try {
		const newRangeResult = await query(newRangeQuery);
		return true;
	} catch(err) {
		throw err;
	}
}

const changeName = async (uuid, newName) => {
	const newNameQuery = {
		text: 'UPDATE factories SET name = $1 WHERE uuid = $2',
		values: [newName, uuid]
	};

	try {
		const newNameResult = await query(newNameQuery);
		return true;
	} catch(err) {
		throw err;
	}
}

const getOne = async uuid => {
	const allFactoriesQuery = {
		text: 'SELECT id, name, uuid, min, max FROM factories WHERE uuid = $1',
		values: [uuid]
	};

	try {
		const singleFactoryResult = await query(allFactoriesQuery);
		if(singleFactoryResult.rows.length < 1) {
			throw new Error('NOTFOUND')
		}

		const factoryRow = singleFactoryResult.rows[0];

		const allChildrenQuery = {
			text: 'SELECT num FROM children WHERE fid = $1',
			values: [factoryRow.id]
		};

		const allChildrenResult = await query(allChildrenQuery);

		return {
			uuid: factoryRow.uuid,
			name: factoryRow.name,
			min: factoryRow.min,
			max: factoryRow.max,
			children: allChildrenResult.rows
		};
	} catch(err) {
		throw err; //Send it upstream for the router error handler
	}
}

const getEverything = async () => {
	const allFactoriesQuery = {
		text: 'SELECT id, name, uuid, min, max FROM factories',
		values: []
	};

	const allChildrenQuery = {
		text: 'SELECT fid, num FROM children',
		values: []
	};

	try {
		const allFactoryResult = await query(allFactoriesQuery);
		const allChildrenResult = await query(allChildrenQuery);

		const allFactoryRows = allFactoryResult.rows;
		const allChildrenRows = allChildrenResult.rows.reduce((acc, cur) => {
			if(!acc[cur.fid]) {
				acc[cur.fid] = [];
			}

			acc[cur.fid].push({number: cur.num});
			return acc;
		}, {});

		return allFactoryRows.sort((a, b) => a.id - b.id).map(row => ({
			uuid: row.uuid,
			name: row.name,
			min: row.min,
			max: row.max,
			children: allChildrenRows[row.id] || []
		}));
	} catch(err) {
		throw err; //Send it upstream for the router error handler
	}
}

const makeFactory = async (name, uuid, numChildren, min = 0, max = 1) => {
	const newFactoryQuery = {
		text: 'INSERT INTO factories(uuid, name, min, max) VALUES($1, $2, $3, $4) RETURNING *',
		values: [uuid, name, min, max]
	};

	try {
		const newFactoryRes = await query(newFactoryQuery);

		if(!numChildren || numChildren < 1) {
			return {
				factory: {
					uuid,
					name,
					min,
					max,
					children: []
				}
			}
		}

		const firstRow = newFactoryRes.rows[0];
		const {id} = firstRow;
		const numSequence = range(0, numChildren).map(n => random(min, max));
		const sequenceQuery = numSequence.map(num => `(${id},${num})`).join(',');
		//The upcoming query is generated solely on the backend, no need to worry about user input.

		//TODO: Move number generation to DB procedure.
		const newChildrenQuery = {
			text: `INSERT INTO children(fid, num) VALUES ${sequenceQuery} RETURNING *`,
			values: []
		};

		const newChildrenResult = await query(newChildrenQuery);

		const children = newChildrenResult.rows.map(row => ({
			number: row.num
		}));

		return {
			factory: {
				uuid,
				name,
				min,
				max,
				children
			}
		};
	} catch(err) {
		throw err;
	}
}

const updateFactory = async (name, uuid, numChildren, min = 0, max = 1) => {

	const setPieces = [['name', name], ['min', min], ['max', max]]
		.filter(pair => !isNil(pair[1]))
		.map(pair => isNumber(pair[1]) ? `${pair[0]} = ${pair[1]}` : `${pair[0]} = '${pair[1]}'`)
		.join(',');

	const newFactoryQuery = {
		text: `UPDATE factories SET ${setPieces} WHERE uuid = $1 RETURNING *`,
		values: [uuid]
	};

	try {
		const newFactoryRes = await query(newFactoryQuery);

		if(!numChildren || numChildren < 1) {
			return {
				factory: {
					uuid,
					name,
					min,
					max,
					children: []
				}
			}
		}



		const firstRow = newFactoryRes.rows[0];
		const {id} = firstRow;

		//Get rid of existing numbers if new children were requested.
		const cleanHouseQuery = {
			text: 'DELETE FROM children WHERE fid = $1',
			values: [id]
		};

		const cleanHouseResult = await query(cleanHouseQuery);
		const numSequence = range(0, numChildren).map(n => random(min, max));
		const sequenceQuery = numSequence.map(num => `(${id},${num})`).join(',');
		const newChildrenQuery = {
			text: `INSERT INTO children(fid, num) VALUES ${sequenceQuery} RETURNING *`,
			values: []
		};

		const newChildrenResult = await query(newChildrenQuery);

		const children = newChildrenResult.rows.map(row => ({
			number: row.num
		}));

		return {
			factory: {
				uuid,
				name,
				min,
				max,
				children
			}
		};
	} catch(err) {
		throw err;
	}
}

module.exports = {
	makeFactory,
	updateFactory,
	getEverything,
	getOne,
	changeName,
	deleteOne,
	regenerateChildren,
	adjustRanges
};