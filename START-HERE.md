# 🚀 START HERE - MySQL Connection Setup

## What You Have

✅ Working MySQL connection from your computer
✅ SSH key authentication (no password needed!)
✅ Automation-ready code
✅ Complete documentation

---

## 📦 Files Overview

### **Use These Files:**

| File | Purpose | When to Use |
|------|---------|-------------|
| **`db-automation.js`** | Main database class | ⭐ Use this in your applications |
| **`example-app.js`** | Working examples | 📚 Learn how to use the class |
| **`QUICK-REFERENCE.md`** | Quick commands | 🔍 When you need quick help |
| **`DEPLOY-TO-SERVER.md`** | Server deployment | 🚀 When deploying to another server |

### **Documentation:**

| File | What It Explains |
|------|------------------|
| `README.md` | Overview and basic examples |
| `QUICK-START.md` | Quick start guide |
| `SSH-TUNNEL-GUIDE.md` | All about SSH tunneling |
| `SETUP-SSH-KEYS.md` | SSH key setup details |
| `CREATE-AUTOMATION-KEY.md` | About the automation key |

### **Other Files (Optional):**

- `mysql-sample.js` - Comprehensive MySQL examples
- `test-connection.js` - Simple connection test
- `deploy.sh` - Automated deployment script

---

## 🎯 Quick Start

### On Your Computer (Already Working!)

```bash
node db-automation.js
```

Output:
```
✓ SSH connection established
✓ MySQL connection established
Connected to: sdtc_jobfeeder
```

### Deploy to Another Server (3 Steps)

```bash
# 1. Copy files
scp ~/.ssh/id_rsa_mysql user@server:~/.ssh/
scp db-automation.js user@server:~/

# 2. SSH to server
ssh user@server

# 3. On server - setup and run
chmod 600 ~/.ssh/id_rsa_mysql
npm install mysql2 ssh2
node db-automation.js
```

✅ Done! No passwords needed!

---

## 💻 Use in Your Code

### Basic Example

```javascript
const DatabaseWithSSH = require('./db-automation');

const db = new DatabaseWithSSH({
    ssh: {
        host: '173.212.247.135',
        username: 'root',
        privateKey: require('fs').readFileSync(
            require('path').join(require('os').homedir(), '.ssh', 'id_rsa_mysql')
        )
    },
    database: {
        host: 'localhost',
        database: 'sdtc_jobfeeder',
        user: 'sdtc_jobfeeder',
        password: '2MdzYXYE23TJfixr'
    }
});

// Connect
await db.connect();

// Query
const products = await db.query('SELECT * FROM products');
console.log(products);

// Close
await db.close();
```

### More Examples

```bash
# Run all examples
node example-app.js

# Run specific example
node example-app.js crud
```

---

## 🔑 Important Files Locations

### On Your Computer:
- SSH Key: `C:\Users\Swarnendu De\.ssh\id_rsa_mysql`
- Code: `D:\Projects\tests\dbtest\db-automation.js`

### On Another Server (Linux):
- SSH Key: `/home/username/.ssh/id_rsa_mysql`
- Code: `/home/username/your-project/db-automation.js`

---

## 📋 Common Tasks

### Test Connection
```bash
node db-automation.js
```

### Insert Data
```javascript
await db.insert('products', { name: 'Item', price: 99.99 });
```

### Query Data
```javascript
const results = await db.query('SELECT * FROM products WHERE price > ?', [50]);
```

### Update Data
```javascript
await db.update('products', { price: 79.99 }, 'id = ?', [1]);
```

### Delete Data
```javascript
await db.delete('products', 'id = ?', [1]);
```

---

## 🔧 Troubleshooting

### Error: Permission denied
```bash
chmod 600 ~/.ssh/id_rsa_mysql
```

### Error: Cannot find module
```bash
npm install mysql2 ssh2
```

### Error: ENOENT id_rsa_mysql
```bash
# Copy the key file to the correct location
cp id_rsa_mysql ~/.ssh/
chmod 600 ~/.ssh/id_rsa_mysql
```

### Connection timeout
```bash
# Test if server is reachable
ping 173.212.247.135
ssh -i ~/.ssh/id_rsa_mysql root@173.212.247.135
```

---

## 🎓 Learning Path

1. **Start here**: Run `node db-automation.js` to see it work
2. **Learn basics**: Run `node example-app.js crud`
3. **See all features**: Run `node example-app.js`
4. **Read docs**: Check `QUICK-REFERENCE.md`
5. **Deploy**: Follow `DEPLOY-TO-SERVER.md`

---

## 📞 Quick Help

**Need to deploy to server?**
→ Read `DEPLOY-TO-SERVER.md`

**Want to see examples?**
→ Run `node example-app.js`

**Quick command reference?**
→ Check `QUICK-REFERENCE.md`

**SSH key issues?**
→ Read `SETUP-SSH-KEYS.md`

---

## ✅ What Works

✅ Automatic connection (no password prompts)
✅ Works on Windows and Linux
✅ Secure SSH key authentication
✅ Helper methods (insert, update, delete, select)
✅ Custom queries
✅ Error handling
✅ Ready for production

---

## 🚀 Next Steps

1. ✅ Test locally: `node db-automation.js`
2. ✅ Try examples: `node example-app.js`
3. ✅ Integrate into your app
4. ✅ Deploy to your server
5. ✅ Run in production!

---

## 📝 Database Details

**Connection Info:**
- Host: 173.212.247.135
- Database: sdtc_jobfeeder
- User: sdtc_jobfeeder
- Connection: Via SSH tunnel (automatic)

**Current Tables:**
- `products` - Product inventory
- `jobs` - Job listings

---

## 🎉 You're Ready!

Everything is set up and working. Just use `db-automation.js` in your applications!

**Questions?** Check the documentation files above.

**Want to deploy?** Follow the 3-step guide in this document.

**Happy coding!** 🚀
