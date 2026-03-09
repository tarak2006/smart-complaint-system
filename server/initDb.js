const { connectAndQuery } = require('./config/db');

async function initDb() {
    console.log('Initializing Database Schema...');

    const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT
    );
    `;

    const complaintsTableQuery = `
    CREATE TABLE IF NOT EXISTS Complaints (
        complaint_id TEXT PRIMARY KEY,
        user_id INTEGER,
        appliance_type TEXT,
        appliance_brand TEXT,
        issue_description TEXT,
        address TEXT,
        preferred_pickup_date TEXT,
        complaint_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        service_status TEXT DEFAULT 'Pending',
        technician_assigned TEXT DEFAULT 'Not Assigned',
        FOREIGN KEY (user_id) REFERENCES Users(id)
    );
    `;

    try {
        console.log('Creating Users table...');
        await connectAndQuery(usersTableQuery);
        console.log('Creating Complaints table...');
        await connectAndQuery(complaintsTableQuery);
        console.log('Database Initialization Complete.');
    } catch (err) {
        console.error('Database Initialization Failed:', err.message);
        process.exit(1);
    }
}

initDb();
