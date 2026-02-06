const mysql = require('mysql2/promise');

// Database configuration for Contabo via SSH Tunnel
const dbConfig = {
    host: 'localhost',
    port: 3307,
    database: 'sdtc_jobfeeder',
    user: 'sdtc_jobfeeder',
    password: '2MdzYXYE23TJfixr',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function setupDatabase() {
    console.log('Connecting to Contabo MySQL server...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id VARCHAR(255) UNIQUE,
                job_title VARCHAR(255),
                employer_name VARCHAR(255),
                job_location VARCHAR(255),
                job_country VARCHAR(100),
                job_employment_type VARCHAR(100),
                job_is_remote TINYINT(1) DEFAULT 0,
                job_posted_at_datetime_utc DATETIME,
                job_apply_link TEXT,
                job_google_link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (job_posted_at_datetime_utc)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

        console.log('Creating "jobs" table if it does not exist...');
        await connection.execute(createTableQuery);
        console.log('✓ Table "jobs" is ready.');

        // Verify by listing tables
        const [rows] = await connection.execute('SHOW TABLES LIKE "jobs"');
        if (rows.length > 0) {
             console.log('✓ Verification successful: Table "jobs" exists.');
        } else {
             console.error('✗ Verification failed: Table "jobs" was not found.');
        }

    } catch (error) {
        console.error('Error setting up database:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
}

setupDatabase();
