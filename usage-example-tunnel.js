const Database = require('./db-helper-tunnel');

async function exampleUsage() {
    try {
        console.log('=== Database Helper Usage Example (SSH Tunnel) ===\n');

        // 1. Create a table
        console.log('Creating table...');
        await Database.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                quantity INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Table created\n');

        // 2. Insert data using helper
        console.log('Inserting products...');
        const product1Id = await Database.insert('products', {
            name: 'Laptop',
            price: 999.99,
            quantity: 10
        });
        console.log(`✓ Inserted product with ID: ${product1Id}`);

        const product2Id = await Database.insert('products', {
            name: 'Mouse',
            price: 25.50,
            quantity: 50
        });
        console.log(`✓ Inserted product with ID: ${product2Id}\n`);

        // 3. Select all products
        console.log('Fetching all products...');
        const allProducts = await Database.select('products');
        console.log('Products:', allProducts);
        console.log('');

        // 4. Select with WHERE clause
        console.log('Fetching products with price > 50...');
        const expensiveProducts = await Database.select(
            'products',
            'price > ?',
            [50]
        );
        console.log('Expensive products:', expensiveProducts);
        console.log('');

        // 5. Update a product
        console.log('Updating product quantity...');
        const updatedRows = await Database.update(
            'products',
            { quantity: 15 },
            'id = ?',
            [product1Id]
        );
        console.log(`✓ Updated ${updatedRows} row(s)\n`);

        // 6. Select updated product
        const updatedProduct = await Database.select('products', 'id = ?', [product1Id]);
        console.log('Updated product:', updatedProduct);
        console.log('');

        // 7. Raw query example
        console.log('Running custom query...');
        const result = await Database.query(
            'SELECT name, price FROM products WHERE quantity > ? ORDER BY price DESC',
            [5]
        );
        console.log('Custom query result:', result);
        console.log('');

        // 8. Delete a product
        console.log('Deleting a product...');
        const deletedRows = await Database.delete('products', 'id = ?', [product2Id]);
        console.log(`✓ Deleted ${deletedRows} row(s)\n`);

        // 9. Final product list
        console.log('Final product list:');
        const finalProducts = await Database.select('products');
        console.log(finalProducts);

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // Close database connection
        await Database.close();
        console.log('\n✓ Database connection closed');
    }
}

// Run the example
exampleUsage();
