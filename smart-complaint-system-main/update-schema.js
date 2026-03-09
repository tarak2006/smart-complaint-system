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
        
        console.log('Creating/Updating BotNotifications table...');
        const createNotificationsTable = `
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('BotNotifications') AND type in ('U'))
            BEGIN
                CREATE TABLE BotNotifications (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    complaint_id NVARCHAR(50) NULL,
                    message NVARCHAR(MAX) NOT NULL,
                    status NVARCHAR(50) DEFAULT 'Unread',
                    created_at DATETIME DEFAULT GETDATE()
                )
            END
        `;
        await pool.request().query(createNotificationsTable);
        console.log('BotNotifications table created successfully.');
        
            // Create ChatMessages table for real-time chat
            console.log('Creating/Updating ChatMessages table...');
            const createChatTable = `
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('ChatMessages') AND type in ('U'))
                BEGIN
                    CREATE TABLE ChatMessages (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        complaint_id NVARCHAR(50) NOT NULL,
                        sender_role NVARCHAR(50) NOT NULL,
                        sender_id INT NOT NULL,
                        message NVARCHAR(MAX) NOT NULL,
                        created_at DATETIME DEFAULT GETDATE()
                    )
                END
            `;
            await pool.request().query(createChatTable);
            console.log('ChatMessages table created successfully.');
        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Schema update failed:', err);
        process.exit(1);
    }
}

updateSchema();
