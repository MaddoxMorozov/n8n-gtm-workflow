# MySQL Database Connection Examples

This folder contains sample code for connecting to the MySQL database.

## Database Configuration

- **Host**: 173.212.247.135
- **Port**: 3306
- **Database**: sdtc_jobfeeder
- **Username**: sdtc_jobfeeder
- **Password**: 2MdzYXYE23TJfixr

## Files Overview

### 1. `test-connection.js`
Simple connection test script that verifies database connectivity and lists tables.

**Usage:**
```bash
node test-connection.js
```

### 2. `mysql-sample.js`
Comprehensive example showing all common database operations:
- Simple connection
- Create table
- Insert data
- Select/query data
- Update records
- Delete records
- Transactions
- Search with conditions

**Usage:**
```bash
node mysql-sample.js
```

### 3. `db-helper.js`
A reusable Database helper class that provides simple methods for common operations:
- `query(sql, params)` - Execute raw SQL
- `insert(table, data)` - Insert records
- `update(table, data, where, whereParams)` - Update records
- `delete(table, where, whereParams)` - Delete records
- `select(table, where, whereParams, columns)` - Select records
- `close()` - Close connection pool

**This is the recommended approach for production code.**

### 4. `usage-example.js`
Practical example using the Database helper class.

**Usage:**
```bash
node usage-example.js
```

## Quick Start

### Basic Connection Example

```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
    host: '173.212.247.135',
    port: 3306,
    database: 'sdtc_jobfeeder',
    user: 'sdtc_jobfeeder',
    password: '2MdzYXYE23TJfixr'
});

const [rows] = await connection.execute('SELECT * FROM your_table');
console.log(rows);

await connection.end();
```

### Using the Helper Class

```javascript
const Database = require('./db-helper');

// Insert
const id = await Database.insert('users', {
    name: 'John Doe',
    email: 'john@example.com'
});

// Select
const users = await Database.select('users', 'age > ?', [25]);

// Update
await Database.update('users', { age: 30 }, 'id = ?', [id]);

// Delete
await Database.delete('users', 'id = ?', [id]);

// Close connection
await Database.close();
```

## Connection Through SSH Tunnel

If you need to connect through an SSH tunnel (for security):

```bash
ssh -f -N -L 3307:localhost:3306 root@173.212.247.135
```

Then connect to:
- Host: `localhost`
- Port: `3307`

## Important Notes

1. **Connection Pooling**: For production, use connection pooling (included in db-helper.js)
2. **Error Handling**: Always use try-catch blocks
3. **Parameterized Queries**: Always use `?` placeholders to prevent SQL injection
4. **Close Connections**: Always close connections/pools when done

## Dependencies

Install required package:
```bash
npm install mysql2
```

## Security Warning

⚠️ **Never commit database credentials to version control!**

Consider using environment variables:
```javascript
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};
```
