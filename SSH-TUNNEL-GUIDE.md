# SSH Tunnel for MySQL - Complete Guide

## The Problem

Direct MySQL connection fails because your IP (122.160.187.235) is not whitelisted on the server. You need to connect through SSH tunnel, but manual password entry won't work in automated code.

## Solutions

### Option 1: SSH Key Authentication (Best for Production) ⭐

**Advantages:**
- No password needed in code
- More secure
- Works automatically

**Setup Steps:**

1. **Generate SSH key** (if you don't have one):
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
```

2. **Copy public key to server**:
```bash
ssh-copy-id root@173.212.247.135
```
Or manually:
```bash
# Display your public key
cat ~/.ssh/id_rsa.pub

# Then SSH to server and add it to authorized_keys
ssh root@173.212.247.135
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the public key and save
```

3. **Test connection** (should work without password):
```bash
ssh root@173.212.247.135 "echo 'Success!'"
```

4. **Now use any of the simple tunnel scripts** without password!

---

### Option 2: SSH Tunnel in Code with Password

**Use when:** You can't set up SSH keys (temporary access, restricted environment)

**Security Warning:** ⚠️ Never commit passwords to version control!

#### Example 1: Using `tunnel-ssh` package

```javascript
const mysql = require('mysql2/promise');
const tunnel = require('tunnel-ssh');

const sshConfig = {
    host: '173.212.247.135',
    port: 22,
    username: 'root',
    password: process.env.SSH_PASSWORD // Use environment variable!
};

// ... see simple-ssh-tunnel.js for full example
```

#### Example 2: Using `ssh2` package

```javascript
const { Client } = require('ssh2');
const mysql = require('mysql2/promise');

// ... see db-with-ssh-tunnel.js for full example
```

---

### Option 3: Environment Variables (Secure Password Storage)

Create a `.env` file:

```env
SSH_HOST=173.212.247.135
SSH_PORT=22
SSH_USER=root
SSH_PASSWORD=your_ssh_password_here

DB_HOST=localhost
DB_PORT=3307
DB_NAME=sdtc_jobfeeder
DB_USER=sdtc_jobfeeder
DB_PASSWORD=2MdzYXYE23TJfixr
```

Install dotenv:
```bash
npm install dotenv
```

Use in code:
```javascript
require('dotenv').config();

const sshConfig = {
    host: process.env.SSH_HOST,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD
};

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};
```

**Important:** Add `.env` to `.gitignore`!

---

### Option 4: Ask Database Admin to Whitelist Your IP

Request admin to run:
```sql
GRANT ALL PRIVILEGES ON sdtc_jobfeeder.*
TO 'sdtc_jobfeeder'@'122.160.187.235'
IDENTIFIED BY '2MdzYXYE23TJfixr';

FLUSH PRIVILEGES;
```

Then you can connect directly without SSH tunnel:
```javascript
const config = {
    host: '173.212.247.135',
    port: 3306,
    database: 'sdtc_jobfeeder',
    user: 'sdtc_jobfeeder',
    password: '2MdzYXYE23TJfixr'
};
```

---

## Comparison

| Method | Security | Ease of Setup | Best For |
|--------|----------|---------------|----------|
| SSH Keys | ⭐⭐⭐⭐⭐ | Medium | Production servers |
| Password + Env Vars | ⭐⭐⭐ | Easy | Development |
| IP Whitelist | ⭐⭐⭐⭐ | Easy (needs admin) | Trusted networks |
| Manual SSH Tunnel | ⭐⭐ | Easy | One-time testing |

---

## Files in This Project

1. **`simple-ssh-tunnel.js`** - Basic SSH tunnel with password
2. **`db-with-ssh-tunnel.js`** - Advanced SSH tunnel class
3. **`db-helper-tunnel.js`** - Assumes tunnel is already running (manual setup)
4. **`usage-example-tunnel.js`** - Works with manual SSH tunnel

---

## Recommended Approach

**For Production/Another Server:**

1. Set up SSH key authentication (Option 1)
2. Use environment variables for all credentials
3. Use connection pooling (mysql2 pool)
4. Add error handling and reconnection logic

**For Development/Testing:**

1. Use manual SSH tunnel: `ssh -L 3307:localhost:3306 root@173.212.247.135`
2. Connect to localhost:3307
3. Keep it simple!

---

## Security Checklist

- [ ] Never commit passwords to Git
- [ ] Use `.env` file with `.gitignore`
- [ ] Use SSH keys instead of passwords when possible
- [ ] Use connection pooling
- [ ] Close connections properly
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Limit database user privileges
- [ ] Use SSL/TLS for MySQL connection when possible

---

## Troubleshooting

**SSH connection times out:**
- Check if port 22 is open: `telnet 173.212.247.135 22`
- Verify SSH service is running

**SSH password rejected:**
- Verify password is correct
- Check if password authentication is enabled on server

**MySQL connection through tunnel fails:**
- Ensure tunnel is established first
- Check if MySQL is running on server
- Verify MySQL user/password

**"Address already in use" error:**
- Port 3307 is already bound
- Kill existing SSH tunnel: `pkill -f "ssh.*3307"`
- Or use a different local port
