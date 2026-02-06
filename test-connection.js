const mysql = require('mysql2/promise');

async function testConnection() {
    const config = {
        host: 'localhost',
        port: 3307,
        database: 'sdtc_jobfeeder',
        user: 'sdtc_jobfeeder',
        password: '2MdzYXYE23TJfixr',
        connectTimeout: 10000
    };

    console.log('Attempting to connect to MySQL database...');
    console.log(`Host: ${config.host}:${config.port}`);
    console.log(`Database: ${config.database}`);
    console.log(`User: ${config.user}`);
    console.log('');

    try {
        const connection = await mysql.createConnection(config);
        console.log('✓ Successfully connected to the database!');

        // Test a simple query
        const [rows] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as version, NOW() as server_time');
        console.log('\nDatabase Info:');
        console.log('  Current Database:', rows[0].current_db);
        console.log('  MySQL Version:', rows[0].version);
        console.log('  Server Time:', rows[0].server_time);

        // List tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\nTables in database:');
        if (tables.length > 0) {
            tables.forEach(table => {
                console.log('  -', Object.values(table)[0]);
            });
        } else {
            console.log('  (no tables found)');
        }

        await connection.end();
        console.log('\n✓ Connection closed successfully');

    } catch (error) {
        console.error('✗ Connection failed:');
        console.error('  Error:', error.message);
        console.error('  Code:', error.code);
        if (error.errno) {
            console.error('  Error Number:', error.errno);
        }
        process.exit(1);
    }
}

testConnection();
