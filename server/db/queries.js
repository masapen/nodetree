const query = require('./query');
const { random, range } = require('lodash');

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
		text: 'SELECT id, uuid, min, max FROM factories WHERE uuid = $1',
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
		text: 'SELECT id, uuid, min, max FROM factories',
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

		return allFactoryRows.map(row => ({
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
		const numSequence = range(0, numChildren).map(n => range(min, max + 1));
		const sequenceQuery = numSequence.map(num => `(${id},${num})`).join(',');
		//The upcoming query is generated solely on the backend, no need to worry about user input.

		const newChildrenQuery = {
			text: `INSERT INTO children(fid, num) VALUES ${sequenceQuery} RETURNING *`,
			values: []
		};

		console.log(newChildrenQuery);
		const newChildrenResult = await query(newChildrenQuery);

		const children = newChildrenResult.res.rows.map(row => ({
			number: num
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
	getEverything,
	getOne,
	changeName
};