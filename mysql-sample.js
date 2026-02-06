const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: '173.212.247.135',
    port: 3306,
    database: 'sdtc_jobfeeder',
    user: 'sdtc_jobfeeder',
    password: '2MdzYXYE23TJfixr',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool (recommended for production)
const pool = mysql.createPool(dbConfig);

// Example 1: Simple connection and query
async function simpleConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database');

        const [rows] = await connection.execute('SELECT DATABASE() as db, VERSION() as version');
        console.log('Database:', rows[0].db);
        console.log('Version:', rows[0].version);

        await connection.end();
    } catch (error) {
        console.error('Connection error:', error.message);
    }
}

// Example 2: Create a table
async function createTable() {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                age INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Table "users" created successfully');
    } catch (error) {
        console.error('Create table error:', error.message);
    } finally {
        connection.release();
    }
}

// Example 3: Insert data
async function insertUser(name, email, age) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
            [name, email, age]
        );
        console.log(`✓ User inserted with ID: ${result.insertId}`);
        return result.insertId;
    } catch (error) {
        console.error('Insert error:', error.message);
    } finally {
        connection.release();
    }
}

// Example 4: Select data
async function getUsers() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM users');
        console.log('\n=== Users List ===');
        rows.forEach(user => {
            console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Age: ${user.age}`);
        });
        return rows;
    } catch (error) {
        console.error('Select error:', error.message);
    } finally {
        connection.release();
    }
}

// Example 5: Update data
async function updateUser(id, newAge) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            'UPDATE users SET age = ? WHERE id = ?',
            [newAge, id]
        );
        console.log(`✓ Updated ${result.affectedRows} row(s)`);
    } catch (error) {
        console.error('Update error:', error.message);
    } finally {
        connection.release();
    }
}

// Example 6: Delete data
async function deleteUser(id) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        console.log(`✓ Deleted ${result.affectedRows} row(s)`);
    } catch (error) {
        console.error('Delete error:', error.message);
    } finally {
        connection.release();
    }
}

// Example 7: Transaction example
async function transferExample() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Multiple operations in a transaction
        await connection.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
            ['Transaction User 1', 'trans1@example.com', 30]);
        await connection.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
            ['Transaction User 2', 'trans2@example.com', 25]);

        await connection.commit();
        console.log('✓ Transaction completed successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Transaction error, rolled back:', error.message);
    } finally {
        connection.release();
    }
}

// Example 8: Prepared statements with multiple queries
async function searchUsers(minAge) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE age >= ? ORDER BY age DESC',
            [minAge]
        );
        console.log(`\n=== Users with age >= ${minAge} ===`);
        rows.forEach(user => {
            console.log(`${user.name} (${user.age} years old)`);
        });
        return rows;
    } catch (error) {
        console.error('Search error:', error.message);
    } finally {
        connection.release();
    }
}

// Main execution function
async function main() {
    try {
        console.log('=== MySQL Sample Code Demo ===\n');

        // 1. Test connection
        await simpleConnection();
        console.log('');

        // 2. Create table
        await createTable();
        console.log('');

        // 3. Insert users
        console.log('--- Inserting Users ---');
        await insertUser('John Doe', 'john@example.com', 28);
        await insertUser('Jane Smith', 'jane@example.com', 32);
        await insertUser('Bob Johnson', 'bob@example.com', 45);
        console.log('');

        // 4. Get all users
        await getUsers();
        console.log('');

        // 5. Update a user
        console.log('--- Updating User ---');
        await updateUser(1, 29);
        console.log('');

        // 6. Search users
        await searchUsers(30);
        console.log('');

        // 7. Transaction example
        console.log('--- Transaction Example ---');
        await transferExample();
        console.log('');

        // 8. Get all users again
        await getUsers();
        console.log('');

        // 9. Delete a user
        console.log('--- Deleting User ---');
        await deleteUser(1);
        console.log('');

        // 10. Final user list
        await getUsers();

    } catch (error) {
        console.error('Main error:', error.message);
    } finally {
        // Close the pool
        await pool.end();
        console.log('\n✓ Connection pool closed');
    }
}

// Run the demo
main();
