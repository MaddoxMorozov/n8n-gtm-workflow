const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
const fs = require('fs');
const os = require('os');
const path = require('path');

class DatabaseWithSSH {
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
                console.log('✓ SSH connection established');

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

                            console.log('✓ MySQL connection established');
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

            // Connect using automation key (no passphrase!)
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

    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = await this.query(sql, values);
        return result.insertId;
    }

    async update(table, data, where, whereParams = []) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        const result = await this.query(sql, [...values, ...whereParams]);
        return result.affectedRows;
    }

    async delete(table, where, whereParams = []) {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const result = await this.query(sql, whereParams);
        return result.affectedRows;
    }

    async select(table, where = '', whereParams = [], columns = '*') {
        const sql = where
            ? `SELECT ${columns} FROM ${table} WHERE ${where}`
            : `SELECT ${columns} FROM ${table}`;
        return await this.query(sql, whereParams);
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
    // Configuration using automation key (no passphrase!)
    const config = {
        ssh: {
            host: '173.212.247.135',
            port: 22,
            username: 'root',
            // Use the automation key we just created
            privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'id_rsa_mysql'))
        },
        database: {
            host: 'localhost',
            database: 'sdtc_jobfeeder',
            user: 'sdtc_jobfeeder',
            password: '2MdzYXYE23TJfixr'
        }
    };

    const db = new DatabaseWithSSH(config);

    try {
        console.log('=== MySQL Automation Demo ===\n');

        // Connect (completely automatic, no password or passphrase!)
        await db.connect();
        console.log('');

        // Test queries
        const info = await db.query('SELECT DATABASE() as db, VERSION() as version, NOW() as time');
        console.log('Connected to:', info[0].db);
        console.log('MySQL version:', info[0].version);
        console.log('Server time:', info[0].time);
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

        // Example: Work with products table
        try {
            const products = await db.select('products', '', [], '*');
            console.log(`Found ${products.length} products:`);
            products.forEach(p => {
                console.log(`  - ${p.name}: $${p.price}`);
            });
        } catch (e) {
            console.log('(products table not found)');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        console.log('');
        await db.close();
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = DatabaseWithSSH;
