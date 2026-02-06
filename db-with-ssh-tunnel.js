const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
const fs = require('fs');

class DatabaseWithSSH {
    constructor(sshConfig, dbConfig) {
        this.sshConfig = sshConfig;
        this.dbConfig = dbConfig;
        this.sshClient = null;
        this.pool = null;
    }

    // Connect through SSH tunnel
    async connect() {
        return new Promise((resolve, reject) => {
            this.sshClient = new Client();

            this.sshClient.on('ready', async () => {
                console.log('✓ SSH connection established');

                // Forward local port to remote MySQL
                this.sshClient.forwardOut(
                    '127.0.0.1',
                    0,
                    '127.0.0.1',
                    this.dbConfig.remotePort,
                    async (err, stream) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        // Create MySQL connection through the tunnel
                        this.pool = mysql.createPool({
                            host: this.dbConfig.host,
                            port: this.dbConfig.localPort,
                            database: this.dbConfig.database,
                            user: this.dbConfig.user,
                            password: this.dbConfig.password,
                            stream: stream,
                            waitForConnections: true,
                            connectionLimit: 10,
                            queueLimit: 0
                        });

                        console.log('✓ MySQL connection pool created');
                        resolve();
                    }
                );
            });

            this.sshClient.on('error', (err) => {
                reject(err);
            });

            // Connect with password or private key
            this.sshClient.connect(this.sshConfig);
        });
    }

    // Execute query
    async query(sql, params = []) {
        if (!this.pool) {
            throw new Error('Not connected. Call connect() first.');
        }
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(sql, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    // Close connections
    async close() {
        if (this.pool) {
            await this.pool.end();
        }
        if (this.sshClient) {
            this.sshClient.end();
        }
        console.log('✓ Connections closed');
    }
}

// Example usage with PASSWORD
async function exampleWithPassword() {
    const db = new DatabaseWithSSH(
        {
            host: '173.212.247.135',
            port: 22,
            username: 'root',
            password: 'YOUR_SSH_ROOT_PASSWORD_HERE' // Replace with actual password
        },
        {
            host: 'localhost',
            localPort: 3307,
            remotePort: 3306,
            database: 'sdtc_jobfeeder',
            user: 'sdtc_jobfeeder',
            password: '2MdzYXYE23TJfixr'
        }
    );

    try {
        await db.connect();

        // Test query
        const result = await db.query('SELECT DATABASE() as db, VERSION() as version');
        console.log('Database:', result[0].db);
        console.log('Version:', result[0].version);

        // Your queries here
        const tables = await db.query('SHOW TABLES');
        console.log('Tables:', tables);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

// Example usage with PRIVATE KEY (more secure)
async function exampleWithPrivateKey() {
    const db = new DatabaseWithSSH(
        {
            host: '173.212.247.135',
            port: 22,
            username: 'root',
            privateKey: fs.readFileSync('/path/to/your/private/key') // e.g., ~/.ssh/id_rsa
        },
        {
            host: 'localhost',
            localPort: 3307,
            remotePort: 3306,
            database: 'sdtc_jobfeeder',
            user: 'sdtc_jobfeeder',
            password: '2MdzYXYE23TJfixr'
        }
    );

    try {
        await db.connect();

        // Your queries here
        const result = await db.query('SELECT * FROM products LIMIT 5');
        console.log('Products:', result);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

module.exports = DatabaseWithSSH;

// Uncomment to run example
// exampleWithPassword();
