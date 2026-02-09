# n8n GTM Workflow - SSH Tunnel

SSH tunnel service for connecting n8n to a remote MySQL database securely.

## Local Development

```bash
npm install
node start_tunnel.js
```

The tunnel will listen on `localhost:3307` and forward to the remote MySQL server.

## Deploy to Render

### 1. Push to GitHub

```bash
git add -A && git commit -m "Add Render deployment" && git push
```

### 2. Create Worker on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Background Worker**
3. Connect your GitHub repo: `MaddoxMorozov/n8n-gtm-workflow`
4. Configure:
   - **Name**: `mysql-ssh-tunnel`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node start_tunnel.js`

### 3. Add Environment Variables

In Render Dashboard → Environment:

| Variable          | Value                                      |
| ----------------- | ------------------------------------------ |
| `SSH_HOST`        | `173.212.247.135`                          |
| `SSH_PORT`        | `22`                                       |
| `SSH_USERNAME`    | `root`                                     |
| `SSH_PRIVATE_KEY` | _(base64 encoded private key - see below)_ |
| `REMOTE_HOST`     | `127.0.0.1`                                |
| `REMOTE_PORT`     | `3306`                                     |

### 4. Encode SSH Private Key

Run this locally to get the base64-encoded key:

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("C:\Users\Maddox\.ssh\id_rsa_mysql"))
```

Copy the output and paste it as the `SSH_PRIVATE_KEY` value in Render.

## n8n Configuration

After the tunnel is running on Render, configure n8n MySQL nodes:

- **Host**: Your Render service internal URL or `localhost` if n8n is on same network
- **Port**: `3307` (or the PORT assigned by Render)
- **Database**: `sdtc_jobfeeder`
- **User**: `sdtc_jobfeeder`
- **Password**: Your database password
