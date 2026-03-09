const { poolPromise } = require('./config/db');

async function updateSchema() {
    try {
        const pool = await poolPromise;
        console.log('Adding role column to Users table...');
        await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'role') ALTER TABLE Users ADD role nvarchar(50) DEFAULT 'User'");
        console.log('Role column added successfully (or already exists).');
        
        // Update existing users to have a role based on email if null
        // Create Technicians table
        console.log('Creating/Updating Technicians table...');
        const createTechniciansTable = `
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('Technicians') AND type in ('U'))
            BEGIN
                CREATE TABLE Technicians (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    email NVARCHAR(255) NOT NULL UNIQUE,
                    password NVARCHAR(255) NOT NULL,
                    phone_number NVARCHAR(50),
                    role NVARCHAR(50) DEFAULT 'Technician',
                    created_at DATETIME DEFAULT GETDATE()
                )
            END
            ELSE
            BEGIN
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Technicians') AND name = 'password')
                    ALTER TABLE Technicians ADD password NVARCHAR(255) NOT NULL DEFAULT 'temporary_password';
                
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Technicians') AND name = 'role')
                    ALTER TABLE Technicians ADD role NVARCHAR(50) DEFAULT 'Technician';
            END
        `;
        await pool.request().query(createTechniciansTable);
        console.log('Technicians table updated successfully.');
        
        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Schema update failed:', err);
        process.exit(1);
    }
}

updateSchema();
