const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
const fs = require('fs');
const os = require('os');
const path = require('path');

class DatabaseWithSSHKey {
    constructor(config) {
        this.sshConfig = config.ssh;
        this.dbConfig = config.database;
        this.sshClient = null;
        this.dbConnection = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.sshClient = new Client();

            this.sshClient.on('ready', async () => {
                console.log('✓ SSH connection established (using private key)');

                // Create SSH tunnel
                this.sshClient.forwardOut(
                    '127.0.0.1',
                    0,
                    '127.0.0.1',
                    3306,
                    async (err, stream) => {
                        if (err) {
                            this.sshClient.end();
                            reject(err);
                            return;
                        }

                        try {
                            // Connect to MySQL through the tunnel
                            this.dbConnection = await mysql.createConnection({
                                host: this.dbConfig.host,
                                database: this.dbConfig.database,
                                user: this.dbConfig.user,
                                password: this.dbConfig.password,
                                stream: stream
                            });

                            console.log('✓ MySQL connection established through SSH tunnel');
                            resolve();
                        } catch (error) {
                            this.sshClient.end();
                            reject(error);
                        }
                    }
                );
            });

            this.sshClient.on('error', (err) => {
                reject(err);
            });

            // Connect using private key (no password needed!)
            this.sshClient.connect(this.sshConfig);
        });
    }

    async query(sql, params = []) {
        if (!this.dbConnection) {
            throw new Error('Not connected. Call connect() first.');
        }
        const [rows] = await this.dbConnection.execute(sql, params);
        return rows;
    }

    async close() {
        if (this.dbConnection) {
            await this.dbConnection.end();
            console.log('✓ MySQL connection closed');
        }
        if (this.sshClient) {
            this.sshClient.end();
            console.log('✓ SSH connection closed');
        }
    }
}

// Example usage
async function main() {
    // Configuration using SSH private key
    const config = {
        ssh: {
            host: '173.212.247.135',
            port: 22,
            username: 'root',
            // Use private key instead of password
            privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'id_rsa'))
        },
        database: {
            host: 'localhost',
            database: 'sdtc_jobfeeder',
            user: 'sdtc_jobfeeder',
            password: '2MdzYXYE23TJfixr'
        }
    };

    const db = new DatabaseWithSSHKey(config);

    try {
        // Connect (no password prompt!)
        await db.connect();
        console.log('');

        // Test queries
        const info = await db.query('SELECT DATABASE() as db, VERSION() as version');
        console.log('Connected to database:', info[0].db);
        console.log('MySQL version:', info[0].version);
        console.log('');

        // Show tables
        const tables = await db.query('SHOW TABLES');
        console.log('Tables in database:');
        if (tables.length > 0) {
            tables.forEach(row => {
                console.log('  -', Object.values(row)[0]);
            });
        } else {
            console.log('  (no tables)');
        }
        console.log('');

        // Example: Query data
        const products = await db.query('SELECT * FROM products LIMIT 5');
        console.log('Products:', products);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = DatabaseWithSSHKey;
