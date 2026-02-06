const mysql = require('mysql2/promise');
const tunnel = require('tunnel-ssh');

// Configuration
const sshConfig = {
    host: '173.212.247.135',
    port: 22,
    username: 'root',
    password: 'YOUR_SSH_ROOT_PASSWORD_HERE', // Replace with actual SSH password
    // OR use private key instead:
    // privateKey: require('fs').readFileSync('/path/to/private/key')
};

const tunnelConfig = {
    autoClose: true
};

const serverConfig = {
    host: '127.0.0.1',
    port: 3306
};

const forwardConfig = {
    srcAddr: '127.0.0.1',
    srcPort: 3307,
    dstAddr: '127.0.0.1',
    dstPort: 3306
};

const dbConfig = {
    host: 'localhost',
    port: 3307,
    database: 'sdtc_jobfeeder',
    user: 'sdtc_jobfeeder',
    password: '2MdzYXYE23TJfixr'
};

async function main() {
    let [server, connection] = [null, null];

    try {
        // Create SSH tunnel
        console.log('Creating SSH tunnel...');
        [server, connection] = await tunnel(
            tunnelConfig,
            serverConfig,
            sshConfig,
            forwardConfig
        );
        console.log('✓ SSH tunnel established on port 3307\n');

        // Connect to MySQL through tunnel
        console.log('Connecting to MySQL...');
        const db = await mysql.createConnection(dbConfig);
        console.log('✓ MySQL connected\n');

        // Test queries
        const [info] = await db.execute('SELECT DATABASE() as db, VERSION() as version');
        console.log('Database:', info[0].db);
        console.log('Version:', info[0].version);
        console.log('');

        const [tables] = await db.execute('SHOW TABLES');
        console.log('Tables:', tables);

        // Close MySQL connection
        await db.end();
        console.log('\n✓ MySQL connection closed');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close SSH tunnel
        if (server) {
            server.close();
            console.log('✓ SSH tunnel closed');
        }
    }
}

main();
