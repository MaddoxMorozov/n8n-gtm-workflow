# Create Unencrypted SSH Key for Automation

## Problem
Your current SSH key (`~/.ssh/id_rsa`) is encrypted with a passphrase, which means code will still prompt for the passphrase when using it.

## Solution Options

### Option 1: Create New Unencrypted Key for Automation (Recommended)

Generate a new SSH key **without** a passphrase specifically for this automation:

```bash
# Create a new key without passphrase
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_mysql -N ""

# Copy the NEW public key to server
cat ~/.ssh/id_rsa_mysql.pub | ssh root@173.212.247.135 "cat >> ~/.ssh/authorized_keys"

# Test the new key
ssh -i ~/.ssh/id_rsa_mysql root@173.212.247.135 "echo 'Success!'"
```

Then in your code, use the new key:
```javascript
privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'id_rsa_mysql'))
```

**Security:** Keep `id_rsa_mysql` secure (600 permissions), only on servers that need it.

---

### Option 2: Remove Passphrase from Existing Key

```bash
# Remove passphrase from your current key (will ask for current passphrase)
ssh-keygen -p -f ~/.ssh/id_rsa

# When prompted:
# - Enter old passphrase
# - Press Enter twice for new passphrase (empty = no passphrase)
```

**Warning:** This makes your existing key less secure if your computer is compromised.

---

### Option 3: Use SSH Agent (Works on Your Computer Only)

Start SSH agent and add your key once:
```bash
# Start agent
eval $(ssh-agent)

# Add key (enter passphrase once)
ssh-add ~/.ssh/id_rsa

# Test - should work without passphrase prompt
ssh root@173.212.247.135 "echo 'Success!'"
```

Then use agent forwarding in code - but this **won't work on other servers**.

---

## Recommended: Option 1

Create dedicated automation key:

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_mysql -N ""
cat ~/.ssh/id_rsa_mysql.pub | ssh root@173.212.247.135 "cat >> ~/.ssh/authorized_keys"
```

This keeps your personal key secure while allowing automation to work.

---

## For Another Server

Copy the automation key to your other server:

```bash
# Copy to another server
scp ~/.ssh/id_rsa_mysql user@another-server:~/.ssh/
scp ~/.ssh/id_rsa_mysql.pub user@another-server:~/.ssh/

# On that server, set permissions
ssh user@another-server "chmod 600 ~/.ssh/id_rsa_mysql"
```

Then in code on that server:
```javascript
privateKey: fs.readFileSync('/home/user/.ssh/id_rsa_mysql')
```
