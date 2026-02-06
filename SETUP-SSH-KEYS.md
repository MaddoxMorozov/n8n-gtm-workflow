# How to Setup SSH Keys for Passwordless Access

## Your Public Key

Your public key is located at: `~/.ssh/id_rsa.pub`

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC24z8EVmPmBKsp/uwPzZoHRrAFbHfdC9dTyC4iA75zrADBZbMFPWKREXOnla6x0agJ5tiNkg5FjYb3RldUdEueHq+6YRjPX1pXCEd1tLMzZUa3Jp3qq57QKhccSTYqMZ5aBdRHlZO2nNSXTBjstOMxtpn9yX6CCsmkIPIUR7elKsDGRpxhCc+zoXpec6nxTDAE4KQleBVPdcBJLTpQ6/gO2arog/K5ydS8MgqRHLicW6NoOGQ1x8lUsNioN3IjSLofL2XMjcu/vrkTjDO2P1XNlNaCqrPOErg3Hut/O/bI2VidSTszNfJiB4STjHnUcZzVk0LGPZ3H8F5qXmhhdGzfy9Hy9/LhWfPytwoSPVu9VCxqM+eJM5AagBPswloBLAGv9PvmOn9ip2vHDyBbp1jmJ0NiZ75zYx8Zeog5mPJ28BWrkYSePftFKlkSbdk4ljqQrA9/kvJg53sDQTv7c8NYfWtLXHMk+/hUAQ+cZ8Er9/8ytF5KnkS+8Q7J2x/qv9tyBpmcBZ+1qMait62qrET9UGD+ocXW79WlSn2qaWOZEqSSt3ztOmZU47O3n7KEy7i0F+hHpXsIt60/fK7JtOOzQbZypfNUX8q29LDayU3EwVK02zuhz/lyIT4WMy8kYmwHQfjq0VUYAQs8M2+LKMW3OU2MmyOQH9DBcFTzbptDnw== swarnendude@gmail.com
```

---

## Method 1: Automatic (Easiest)

Run this command and enter your SSH password when prompted:

```bash
ssh-copy-id root@173.212.247.135
```

Then test:
```bash
ssh root@173.212.247.135 "echo 'Success!'"
```

If it works without asking for password, you're done! ✅

---

## Method 2: Manual Copy-Paste

If `ssh-copy-id` doesn't work, do this manually:

### Step 1: SSH into the server
```bash
ssh root@173.212.247.135
```
(Enter password when prompted)

### Step 2: On the server, run these commands:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Edit authorized_keys file
nano ~/.ssh/authorized_keys
```

### Step 3: Paste your public key
Copy this entire line into the file:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC24z8EVmPmBKsp/uwPzZoHRrAFbHfdC9dTyC4iA75zrADBZbMFPWKREXOnla6x0agJ5tiNkg5FjYb3RldUdEueHq+6YRjPX1pXCEd1tLMzZUa3Jp3qq57QKhccSTYqMZ5aBdRHlZO2nNSXTBjstOMxtpn9yX6CCsmkIPIUR7elKsDGRpxhCc+zoXpec6nxTDAE4KQleBVPdcBJLTpQ6/gO2arog/K5ydS8MgqRHLicW6NoOGQ1x8lUsNioN3IjSLofL2XMjcu/vrkTjDO2P1XNlNaCqrPOErg3Hut/O/bI2VidSTszNfJiB4STjHnUcZzVk0LGPZ3H8F5qXmhhdGzfy9Hy9/LhWfPytwoSPVu9VCxqM+eJM5AagBPswloBLAGv9PvmOn9ip2vHDyBbp1jmJ0NiZ75zYx8Zeog5mPJ28BWrkYSePftFKlkSbdk4ljqQrA9/kvJg53sDQTv7c8NYfWtLXHMk+/hUAQ+cZ8Er9/8ytF5KnkS+8Q7J2x/qv9tyBpmcBZ+1qMait62qrET9UGD+ocXW79WlSn2qaWOZEqSSt3ztOmZU47O3n7KEy7i0F+hHpXsIt60/fK7JtOOzQbZypfNUX8q29LDayU3EwVK02zuhz/lyIT4WMy8kYmwHQfjq0VUYAQs8M2+LKMW3OU2MmyOQH9DBcFTzbptDnw== swarnendude@gmail.com
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Set correct permissions
```bash
chmod 600 ~/.ssh/authorized_keys
```

### Step 5: Exit the server
```bash
exit
```

### Step 6: Test from your computer
```bash
ssh root@173.212.247.135 "echo 'Success!'"
```

If it works without password, you're done! ✅

---

## Using the Keys in Your Code

### Option A: Use Private Key File

Once SSH keys are set up, you can use them in Node.js:

```javascript
const fs = require('fs');
const { Client } = require('ssh2');

const sshConfig = {
    host: '173.212.247.135',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync('C:/Users/Swarnendu De/.ssh/id_rsa')
    // No password needed!
};
```

### Option B: Use From Another Server

Copy your **private key** (`~/.ssh/id_rsa`) to the other server:

**On your computer:**
```bash
# Copy private key to another server
scp ~/.ssh/id_rsa user@another-server:~/.ssh/
```

**On the other server:**
```bash
# Set correct permissions
chmod 600 ~/.ssh/id_rsa

# Test connection
ssh -i ~/.ssh/id_rsa root@173.212.247.135
```

**In code on the other server:**
```javascript
const sshConfig = {
    host: '173.212.247.135',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync('/home/user/.ssh/id_rsa')
};
```

---

## Security Notes

⚠️ **Important:**
- **Public key** (`id_rsa.pub`) - Safe to share, paste anywhere
- **Private key** (`id_rsa`) - **NEVER share**, keep secure, don't commit to Git

When copying to another server:
- Keep private key permissions at `600` (only you can read)
- Never expose private key in code or logs
- Consider using SSH agent forwarding instead of copying keys

---

## Troubleshooting

**Still asking for password:**
- Check permissions: `ls -la ~/.ssh/` on server
- `authorized_keys` should be `600`
- `.ssh` directory should be `700`

**Permission denied (publickey):**
- Server might not allow key-based auth
- Check `/etc/ssh/sshd_config` on server: `PubkeyAuthentication yes`

**Connection works from your computer but not from another server:**
- You need to copy the private key to the other server
- Or generate a new key pair on that server and add its public key
