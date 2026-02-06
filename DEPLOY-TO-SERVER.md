# How to Deploy MySQL Connection to Another Server

## Prerequisites

- Another server with Node.js installed
- SSH access to that server
- Your automation key: `~/.ssh/id_rsa_mysql`

---

## Step 1: Copy Files to the Server

### Option A: Using SCP (from your computer)

```bash
# Copy the automation key
scp ~/.ssh/id_rsa_mysql user@your-server-ip:~/.ssh/

# Copy the Node.js files
scp db-automation.js user@your-server-ip:~/
scp package.json user@your-server-ip:~/
```

### Option B: Using SFTP or FTP Client
- Copy `id_rsa_mysql` to `~/.ssh/` on the server
- Copy `db-automation.js` and `package.json` to your project directory

---

## Step 2: SSH into Your Server

```bash
ssh user@your-server-ip
```

---

## Step 3: Setup on the Server

```bash
# Set correct permissions for the private key (IMPORTANT!)
chmod 600 ~/.ssh/id_rsa_mysql

# Navigate to your project directory
cd ~/your-project

# Install Node.js dependencies
npm install mysql2 ssh2

# Test the connection
node db-automation.js
```

If it works, you'll see:
```
✓ SSH connection established
✓ MySQL connection established
Connected to: sdtc_jobfeeder
```

---

## Step 4: Customize for Your Application

### Example: Create Your Own Application

```javascript
const DatabaseWithSSH = require('./db-automation');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function yourApplication() {
    // Configuration
    const config = {
        ssh: {
            host: '173.212.247.135',
            port: 22,
            username: 'root',
            // Path may differ on Linux server
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
        await db.connect();

        // Your application logic here
        const products = await db.query('SELECT * FROM products');
        console.log('Products:', products);

        // Insert example
        const newId = await db.insert('products', {
            name: 'New Product',
            price: 49.99,
            quantity: 100
        });
        console.log('Inserted product with ID:', newId);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.close();
    }
}

yourApplication();
```

---

## Common Server Paths

### Linux Server:
```javascript
privateKey: fs.readFileSync('/home/username/.ssh/id_rsa_mysql')
// or
privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'id_rsa_mysql'))
```

### Windows Server:
```javascript
privateKey: fs.readFileSync('C:/Users/username/.ssh/id_rsa_mysql')
// or
privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'id_rsa_mysql'))
```

---

## Security Best Practices

### Use Environment Variables

Create a `.env` file on the server:
```env
SSH_HOST=173.212.247.135
SSH_USER=root
SSH_KEY_PATH=/home/user/.ssh/id_rsa_mysql

DB_NAME=sdtc_jobfeeder
DB_USER=sdtc_jobfeeder
DB_PASSWORD=2MdzYXYE23TJfixr
```

Install dotenv:
```bash
npm install dotenv
```

Update your code:
```javascript
require('dotenv').config();

const config = {
    ssh: {
        host: process.env.SSH_HOST,
        port: 22,
        username: process.env.SSH_USER,
        privateKey: fs.readFileSync(process.env.SSH_KEY_PATH)
    },
    database: {
        host: 'localhost',
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }
};
```

**Important:** Add `.env` to `.gitignore`!

---

## Testing Checklist

On your server, run these tests:

```bash
# 1. Test SSH key works
ssh -i ~/.ssh/id_rsa_mysql root@173.212.247.135 "echo 'Success!'"

# 2. Check key permissions
ls -la ~/.ssh/id_rsa_mysql
# Should show: -rw------- (600)

# 3. Test Node.js connection
node db-automation.js

# 4. Check if dependencies are installed
npm list mysql2 ssh2
```

---

## Troubleshooting

### Error: "ENOENT: no such file or directory"
```bash
# Check if key exists
ls -la ~/.ssh/id_rsa_mysql

# If not, copy it again
scp your-computer:~/.ssh/id_rsa_mysql ~/.ssh/
chmod 600 ~/.ssh/id_rsa_mysql
```

### Error: "Permission denied (publickey)"
```bash
# Key permissions are wrong
chmod 600 ~/.ssh/id_rsa_mysql

# Test SSH connection manually
ssh -i ~/.ssh/id_rsa_mysql root@173.212.247.135
```

### Error: "Cannot find module 'mysql2'"
```bash
# Install dependencies
npm install mysql2 ssh2
```

### Error: "connect ETIMEDOUT"
```bash
# Check if server can reach MySQL server
ping 173.212.247.135

# Check if port 22 is open
telnet 173.212.247.135 22
```

---

## Production Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start your application
pm2 start db-automation.js --name "mysql-app"

# Make it run on server restart
pm2 startup
pm2 save

# Monitor
pm2 logs mysql-app
```

### Using Systemd (Linux Service)

Create `/etc/systemd/system/mysql-app.service`:
```ini
[Unit]
Description=MySQL Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/your-project
ExecStart=/usr/bin/node /home/your-username/your-project/db-automation.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mysql-app
sudo systemctl start mysql-app
sudo systemctl status mysql-app
```

---

## Quick Commands Reference

```bash
# Copy key to server
scp ~/.ssh/id_rsa_mysql user@server:~/.ssh/

# Copy application files
scp db-automation.js package.json user@server:~/project/

# On the server
chmod 600 ~/.ssh/id_rsa_mysql
cd ~/project
npm install
node db-automation.js
```

---

## Next Steps

1. ✅ Copy files to your server
2. ✅ Set permissions: `chmod 600 ~/.ssh/id_rsa_mysql`
3. ✅ Install dependencies: `npm install mysql2 ssh2`
4. ✅ Test: `node db-automation.js`
5. ✅ Integrate into your application
6. ✅ Use environment variables for security
7. ✅ Set up process manager (PM2 or systemd)

Your database connection is now fully automated and portable! 🚀
