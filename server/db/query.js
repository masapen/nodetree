const { Pool } = require('pg');

const pool = new Pool();

const query = queryObj => pool.query(queryObj);

module.exports = query;