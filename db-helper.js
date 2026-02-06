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

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database helper class
class Database {
    // Execute a query
    static async query(sql, params = []) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(sql, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    // Insert a record
    static async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');

        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = await this.query(sql, values);
        return result.insertId;
    }

    // Update records
    static async update(table, data, where, whereParams = []) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        const result = await this.query(sql, [...values, ...whereParams]);
        return result.affectedRows;
    }

    // Delete records
    static async delete(table, where, whereParams = []) {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const result = await this.query(sql, whereParams);
        return result.affectedRows;
    }

    // Select records
    static async select(table, where = '', whereParams = [], columns = '*') {
        const sql = where
            ? `SELECT ${columns} FROM ${table} WHERE ${where}`
            : `SELECT ${columns} FROM ${table}`;
        return await this.query(sql, whereParams);
    }

    // Close the pool
    static async close() {
        await pool.end();
    }
}

module.exports = Database;
