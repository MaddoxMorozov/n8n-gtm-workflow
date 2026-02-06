# Quick Start Guide - MySQL Connection with SSH Keys

## Current Situation

✅ You've generated SSH keys (`~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub`)
⏳ Next step: Copy public key to the MySQL server
🎯 Goal: Connect from any server without password prompts

---

## Step 1: Setup SSH Key on MySQL Server

Choose one method:

### Method A: Automatic (Run this command)
```bash
ssh-copy-id root@173.212.247.135
```
Enter your SSH password once, then you're done!

### Method B: Manual
1. SSH to server: `ssh root@173.212.247.135`
2. Create directory: `mkdir -p ~/.ssh && chmod 700 ~/.ssh`
3. Edit file: `nano ~/.ssh/authorized_keys`
4. Paste your public key (see SETUP-SSH-KEYS.md for the key)
5. Save and set permissions: `chmod 600 ~/.ssh/authorized_keys`
6. Exit: `exit`

---

## Step 2: Test Passwordless Connection

```bash
ssh root@173.212.247.135 "echo 'Success!'"
```

Should work **without password prompt**. If yes, proceed! ✅

---

## Step 3: Use in Your Code

### On Your Current Computer

```javascript
const DatabaseWithSSHKey = require('./db-with-ssh-key');
const fs = require('fs');

const db = new DatabaseWithSSHKey({
    ssh: {
        host: '173.212.247.135',
        port: 22,
        username: 'root',
        privateKey: fs.readFileSync('C:/Users/Swarnendu De/.ssh/id_rsa')
    },
    database: {
        host: 'localhost',
        database: 'sdtc_jobfeeder',
        user: 'sdtc_jobfeeder',
        password: '2MdzYXYE23TJfixr'
    }
});

await db.connect();
const results = await db.query('SELECT * FROM products');
await db.close();
```

Run: `node db-with-ssh-key.js`

---

## Step 4: Use on Another Server

### Copy Private Key to Other Server

```bash
# From your computer, copy to another server
scp ~/.ssh/id_rsa user@another-server:~/.ssh/

# SSH to that server
ssh user@another-server

# Set permissions
chmod 600 ~/.ssh/id_rsa

# Test connection
ssh -i ~/.ssh/id_rsa root@173.212.247.135
```

### Use in Code on Another Server

```javascript
const fs = require('fs');
const DatabaseWithSSHKey = require('./db-with-ssh-key');

const db = new DatabaseWithSSHKey({
    ssh: {
        host: '173.212.247.135',
        port: 22,
        username: 'root',
        privateKey: fs.readFileSync('/home/user/.ssh/id_rsa')  // Path on that server
    },
    database: {
        host: 'localhost',
        database: 'sdtc_jobfeeder',
        user: 'sdtc_jobfeeder',
        password: '2MdzYXYE23TJfixr'
    }
});

await db.connect();
// Your code here...
await db.close();
```

---

## Files to Use

- **`db-with-ssh-key.js`** - Complete class using SSH private key (no password!)
- **`SETUP-SSH-KEYS.md`** - Detailed setup instructions
- **`SSH-TUNNEL-GUIDE.md`** - Complete guide with all options

---

## Security Checklist

✅ Public key (`id_rsa.pub`) - Safe to share
⚠️ Private key (`id_rsa`) - Keep secret, never commit to Git
✅ Use environment variables for DB password
✅ Set private key permissions to 600

---

## Troubleshooting

**Still asking for password after setup:**
```bash
# Check server permissions
ssh root@173.212.247.135 "ls -la ~/.ssh/"
# authorized_keys should be 600, .ssh should be 700
```

**Error: ENOENT id_rsa:**
```javascript
// Update path to your private key location
privateKey: fs.readFileSync('/correct/path/to/id_rsa')
```

**Works on your computer but not on another server:**
- You need to copy the private key to that server
- Or generate a new key pair on that server and add its public key

---

## Next Steps

1. ✅ Run `ssh-copy-id root@173.212.247.135`
2. ✅ Test: `ssh root@173.212.247.135 "echo 'Success!'"`
3. ✅ Run: `node db-with-ssh-key.js`
4. ✅ Copy `db-with-ssh-key.js` and private key to your other server
5. ✅ Update file paths in the code for that server
6. ✅ Run your application!

**No more password prompts!** 🎉
