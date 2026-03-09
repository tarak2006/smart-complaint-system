const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// sqlConfig is now dynamically generated inside functions to allow Key Vault to inject secrets first

async function createComplaint(userId, type, brand, issue, address, date) {
    try {
        const sqlConfig = {
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
                encrypt: true, // Required for Azure SQL
                trustServerCertificate: false
            }
        };

        let pool = await sql.connect(sqlConfig);
        const complaintId = `COMP-${uuidv4().substring(0, 8)}`; // Creates ID like COMP-a1b2c3d4

        let result = await pool.request()
            .input('complaint_id', sql.NVarChar, complaintId)
            .input('user_id', sql.Int, userId)
            .input('appliance_type', sql.NVarChar, type)
            .input('appliance_brand', sql.NVarChar, brand)
            .input('issue_description', sql.NVarChar, issue)
            .input('address', sql.NVarChar, address)
            .input('preferred_pickup_date', sql.NVarChar, date)
            .query(`
                INSERT INTO Complaints 
                (complaint_id, user_id, appliance_type, appliance_brand, issue_description, address, preferred_pickup_date)
                VALUES 
                (@complaint_id, @user_id, @appliance_type, @appliance_brand, @issue_description, @address, @preferred_pickup_date)
            `);

        console.log("Complaint logged successfully!");
        return complaintId; // Return this to show the user their tracking number
    } catch (err) {
        console.error("Database Error:", err);
    }
}

async function getComplaintById(complaintId) {
    try {
        const sqlConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            server: process.env.DB_SERVER,
            options: {
                encrypt: true,
                trustServerCertificate: false
            }
        };

        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('complaint_id', sql.NVarChar, complaintId)
            .query('SELECT * FROM Complaints WHERE complaint_id = @complaint_id');

        return result.recordset[0]; // Returns the complaint row or undefined
    } catch (err) {
        console.error("Database Lookup Error:", err);
        return null;
    }
}

module.exports = { createComplaint, getComplaintById };