// Example application showing how to use the database connection
const DatabaseWithSSH = require('./db-automation');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Configuration
const config = {
    ssh: {
        host: '173.212.247.135',
        port: 22,
        username: 'root',
        // This path works on both Windows and Linux
        privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'id_rsa_mysql'))
    },
    database: {
        host: 'localhost',
        database: 'sdtc_jobfeeder',
        user: 'sdtc_jobfeeder',
        password: '2MdzYXYE23TJfixr'
    }
};

// Example 1: Basic CRUD Operations
async function crudExample() {
    const db = new DatabaseWithSSH(config);

    try {
        console.log('=== CRUD Example ===\n');
        await db.connect();

        // CREATE: Insert a new product
        console.log('1. Creating a new product...');
        const productId = await db.insert('products', {
            name: 'Wireless Mouse',
            price: 29.99,
            quantity: 50
        });
        console.log(`✓ Created product with ID: ${productId}\n`);

        // READ: Get all products
        console.log('2. Reading all products...');
        const allProducts = await db.select('products');
        console.log(`✓ Found ${allProducts.length} products`);
        allProducts.forEach(p => {
            console.log(`   - ${p.name}: $${p.price} (Stock: ${p.quantity})`);
        });
        console.log('');

        // UPDATE: Update the product
        console.log('3. Updating product price...');
        await db.update('products', { price: 24.99 }, 'id = ?', [productId]);
        console.log('✓ Product updated\n');

        // READ: Get updated product
        const updatedProduct = await db.select('products', 'id = ?', [productId]);
        console.log('4. Checking updated product...');
        console.log(`✓ ${updatedProduct[0].name} - New price: $${updatedProduct[0].price}\n`);

        // DELETE: Remove the product
        console.log('5. Deleting product...');
        await db.delete('products', 'id = ?', [productId]);
        console.log('✓ Product deleted\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

// Example 2: Custom Queries
async function customQueryExample() {
    const db = new DatabaseWithSSH(config);

    try {
        console.log('=== Custom Query Example ===\n');
        await db.connect();

        // Complex query example
        const results = await db.query(`
            SELECT
                name,
                price,
                quantity,
                (price * quantity) as total_value
            FROM products
            WHERE quantity > ?
            ORDER BY total_value DESC
        `, [0]);

        console.log('Products sorted by total value:');
        results.forEach(p => {
            console.log(`  ${p.name}: $${p.price} × ${p.quantity} = $${p.total_value}`);
        });
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

// Example 3: Transaction-like Operations
async function batchOperations() {
    const db = new DatabaseWithSSH(config);

    try {
        console.log('=== Batch Operations Example ===\n');
        await db.connect();

        // Insert multiple products
        const productsToAdd = [
            { name: 'Keyboard', price: 79.99, quantity: 25 },
            { name: 'Monitor', price: 299.99, quantity: 15 },
            { name: 'Webcam', price: 89.99, quantity: 30 }
        ];

        console.log('Adding multiple products...');
        for (const product of productsToAdd) {
            const id = await db.insert('products', product);
            console.log(`✓ Added ${product.name} with ID: ${id}`);
        }
        console.log('');

        // Get summary
        const summary = await db.query(`
            SELECT
                COUNT(*) as total_products,
                SUM(quantity) as total_quantity,
                SUM(price * quantity) as total_value
            FROM products
        `);

        console.log('Inventory Summary:');
        console.log(`  Total Products: ${summary[0].total_products}`);
        console.log(`  Total Quantity: ${summary[0].total_quantity}`);
        console.log(`  Total Value: $${summary[0].total_value}`);
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

// Example 4: Error Handling
async function errorHandlingExample() {
    const db = new DatabaseWithSSH(config);

    try {
        console.log('=== Error Handling Example ===\n');
        await db.connect();

        // Try to insert with duplicate or invalid data
        try {
            await db.query('SELECT * FROM non_existent_table');
        } catch (error) {
            console.log('✓ Caught expected error:', error.message);
        }

        // Proper error handling with user data
        const userInput = "'; DROP TABLE products; --"; // SQL injection attempt
        try {
            // Using parameterized queries prevents SQL injection
            const results = await db.select('products', 'name = ?', [userInput]);
            console.log('✓ Safe query executed, found:', results.length, 'results');
        } catch (error) {
            console.error('Query failed:', error.message);
        }
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

// Main function to run all examples
async function main() {
    const examples = process.argv[2] || 'all';

    switch (examples) {
        case 'crud':
            await crudExample();
            break;
        case 'query':
            await customQueryExample();
            break;
        case 'batch':
            await batchOperations();
            break;
        case 'error':
            await errorHandlingExample();
            break;
        case 'all':
        default:
            console.log('Running all examples...\n');
            await crudExample();
            console.log('\n' + '='.repeat(50) + '\n');
            await customQueryExample();
            console.log('\n' + '='.repeat(50) + '\n');
            await batchOperations();
            console.log('\n' + '='.repeat(50) + '\n');
            await errorHandlingExample();
            break;
    }

    console.log('\n✅ All examples completed!');
    console.log('\nUsage:');
    console.log('  node example-app.js          - Run all examples');
    console.log('  node example-app.js crud     - Run CRUD example only');
    console.log('  node example-app.js query    - Run custom query example');
    console.log('  node example-app.js batch    - Run batch operations');
    console.log('  node example-app.js error    - Run error handling example');
}

// Run the examples
if (require.main === module) {
    main().catch(console.error);
}
