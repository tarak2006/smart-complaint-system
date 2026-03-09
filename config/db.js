const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ SUCCESS: Connected to Azure SQL');
        return pool;
    })
    .catch(err => {
        if (err.message.includes('Firewall')) {
            console.error('❌ FIREWALL ERROR: Your IP is not allowed. Check Azure SQL Networking settings.');
        } else if (err.message.includes('Login failed')) {
            console.error('❌ LOGIN ERROR: Wrong DB_USER or DB_PASSWORD in .env file.');
        } else {
            console.error('❌ CONNECTION ERROR:', err.message);
        }
        throw err;
    });

async function connectAndQuery(query, params = []) {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Transform ? handles to @p0, @p1, etc. for T-SQL compatibility
        let tsqlQuery = query;
        params.forEach((val, i) => {
            tsqlQuery = tsqlQuery.replace('?', `@p${i}`);
            request.input(`p${i}`, val);
        });

        const result = await request.query(tsqlQuery);
        // Map to .rows to maintain compatibility with the app's SQLite-style expectations
        return { 
            rows: result.recordset || [], 
            rowCount: result.rowsAffected[0],
            insertId: result.recordset && result.recordset[0] ? result.recordset[0].id : null 
        };
    } catch (err) {
        console.error('SQL Query Error:', err);
        throw err;
    }
}

module.exports = { connectAndQuery, sql, poolPromise };
