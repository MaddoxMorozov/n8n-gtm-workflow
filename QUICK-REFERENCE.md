# Quick Reference - Deploy to Another Server

## 🚀 Quick Deploy (3 Steps)

### From Your Computer:

```bash
# 1. Copy SSH key to the server
scp ~/.ssh/id_rsa_mysql user@your-server:~/.ssh/

# 2. Copy application files
scp db-automation.js package.json user@your-server:~/

# 3. SSH to the server and run setup
ssh user@your-server
```

### On Your Server:

```bash
# 1. Set key permissions
chmod 600 ~/.ssh/id_rsa_mysql

# 2. Install dependencies
npm install mysql2 ssh2

# 3. Test it!
node db-automation.js
```

That's it! ✅

---

## 📝 Code Template

```javascript
const DatabaseWithSSH = require('./db-automation');
const fs = require('fs');
const path = require('path');

const db = new DatabaseWithSSH({
    ssh: {
        host: '173.212.247.135',
        port: 22,
        username: 'root',
        privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_rsa_mysql'))
    },
    database: {
        host: 'localhost',
        database: 'sdtc_jobfeeder',
        user: 'sdtc_jobfeeder',
        password: '2MdzYXYE23TJfixr'
    }
});

await db.connect();

// Your code here
const data = await db.query('SELECT * FROM products');

await db.close();
```

---

## 🔧 Common Operations

```javascript
// Insert
const id = await db.insert('products', { name: 'Item', price: 99.99 });

// Select all
const all = await db.select('products');

// Select with WHERE
const filtered = await db.select('products', 'price > ?', [50]);

// Update
await db.update('products', { price: 79.99 }, 'id = ?', [id]);

// Delete
await db.delete('products', 'id = ?', [id]);

// Custom query
const results = await db.query('SELECT * FROM products WHERE price > ?', [100]);
```

---

## 🔍 Troubleshooting

| Error | Solution |
|-------|----------|
| Permission denied | `chmod 600 ~/.ssh/id_rsa_mysql` |
| ENOENT id_rsa_mysql | Copy key: `scp ~/.ssh/id_rsa_mysql user@server:~/.ssh/` |
| Cannot find module | `npm install mysql2 ssh2` |
| Connection timeout | Check server can reach 173.212.247.135 |

---

## 📁 Files You Need

| File | Purpose | Where to Copy |
|------|---------|---------------|
| `id_rsa_mysql` | SSH key | `~/.ssh/` on server |
| `db-automation.js` | Database class | Your project folder |
| `package.json` | Dependencies | Your project folder |

---

## 🔐 Security Checklist

- [ ] Key permissions: `chmod 600 ~/.ssh/id_rsa_mysql`
- [ ] Never commit `id_rsa_mysql` to Git
- [ ] Use environment variables for passwords
- [ ] Add `.env` to `.gitignore`
- [ ] Use parameterized queries (prevent SQL injection)

---

## 📚 More Examples

Run the example application:
```bash
node example-app.js        # All examples
node example-app.js crud   # CRUD operations
node example-app.js query  # Custom queries
node example-app.js batch  # Batch operations
```

---

## 💡 Pro Tips

### Use Environment Variables

Create `.env` file:
```env
SSH_KEY_PATH=/home/user/.ssh/id_rsa_mysql
DB_PASSWORD=2MdzYXYE23TJfixr
```

In code:
```javascript
require('dotenv').config();
privateKey: fs.readFileSync(process.env.SSH_KEY_PATH)
```

### Connection Pooling

For production, keep connection open:
```javascript
// Connect once
await db.connect();

// Use multiple times
await db.query('...');
await db.query('...');

// Close when done
await db.close();
```

### Production Deployment

Use PM2:
```bash
npm install -g pm2
pm2 start db-automation.js
pm2 save
pm2 startup
```

---

## 🆘 Need Help?

See detailed guides:
- `DEPLOY-TO-SERVER.md` - Full deployment guide
- `SETUP-SSH-KEYS.md` - SSH key setup details
- `SSH-TUNNEL-GUIDE.md` - Complete SSH tunnel guide
- `README.md` - Overview and examples

---

## ✅ Quick Test

```bash
# Test SSH key
ssh -i ~/.ssh/id_rsa_mysql root@173.212.247.135 "echo OK"

# Test Node.js connection
node db-automation.js
```

Both should work without password! 🎉
