# Deploy GTM Tool to Render (with Google Auth)

## Architecture

```
User browser
    |
    v
Render Web Service (gtm-tool)
    |
    |-- OAuth2 Proxy (port from Render's PORT env)
    |     |-- Google Sign-In (insightstap.com & sdtcdigital.com only)
    |     |-- Proxies authenticated requests to n8n
    |
    |-- n8n (internal port 5678)
    |     |-- Workflow engine
    |     |-- Webhook endpoints
    |
    |-- SSH Tunnel (port 3307 → remote MySQL 3306)
          |-- Connects to 173.212.247.135
```

All 3 processes run in a single Render Web Service container.

---

## Step-by-Step Setup

### Step 1: Get Google OAuth2 Client Secret

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID:
   `447046445190-al88jt66ddfi8qe18v9m4n3bkticfqbf.apps.googleusercontent.com`
3. Copy the **Client Secret** (you'll need it in Step 4)
4. **Don't add redirect URIs yet** — you need the Render URL first (Step 3)

---

### Step 2: Generate a Cookie Secret

Run this command anywhere (terminal, Python shell, etc.):

```bash
python3 -c "import os,base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
```

Save the output — you'll need it in Step 4.

---

### Step 3: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub/GitLab repo containing the NewGTM code
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `gtm-tool` (or whatever you want) |
| **Region** | Choose closest to you |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile.render` |
| **Plan** | **Standard** ($7/mo) — n8n needs at least 512MB RAM |

5. Click **Create Web Service**
6. Note your Render URL — it will be something like:
   `https://gtm-tool.onrender.com`

---

### Step 4: Set Environment Variables in Render Dashboard

Go to your service → **Environment** tab → Add these:

| Key | Value | Notes |
|-----|-------|-------|
| `SSH_HOST` | `173.212.247.135` | Already set if migrating |
| `SSH_PORT` | `22` | |
| `SSH_USERNAME` | `root` | |
| `SSH_PRIVATE_KEY` | (your base64-encoded private key) | Paste the full base64 string |
| `REMOTE_HOST` | `127.0.0.1` | |
| `REMOTE_PORT` | `3306` | |
| `GOOGLE_CLIENT_ID` | `447046445190-al88jt66ddfi8qe18v9m4n3bkticfqbf.apps.googleusercontent.com` | |
| `GOOGLE_CLIENT_SECRET` | (from Step 1) | **Secret** — click the lock icon |
| `OAUTH2_COOKIE_SECRET` | (from Step 2) | **Secret** — click the lock icon |
| `ALLOWED_EMAIL_DOMAINS` | `insightstap.com,sdtcdigital.com` | Comma-separated |

Click **Save Changes** — Render will auto-redeploy.

---

### Step 5: Update Google Cloud Console

Now that you have your Render URL (e.g. `https://gtm-tool.onrender.com`):

1. Go back to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://gtm-tool.onrender.com/oauth2/callback
   ```
4. Under **Authorized JavaScript origins**, add:
   ```
   https://gtm-tool.onrender.com
   ```
5. Click **Save**

**Important:** Replace `gtm-tool` with your actual Render service name.

---

### Step 6: Import the n8n Workflow

1. Open n8n at your Render URL:
   `https://gtm-tool.onrender.com`
   (First visit will redirect to Google Sign-In)
2. Sign in with your @insightstap.com or @sdtcdigital.com email
3. Go to n8n editor (you may need to access it via the proxy)
4. Import `NewGTM.json`
5. Activate the workflow

---

### Step 7: Verify Everything Works

1. **Test the UI pages:**
   - `https://gtm-tool.onrender.com/webhook/jobs-ui` → Should show Google login, then Jobs page
   - After login, navigate to Leaders and Enriched pages

2. **Test SignalHire callback:**
   - The callback URL is now auto-configured from `WEBHOOK_URL` env var
   - It will be: `https://gtm-tool.onrender.com/webhook/signalhire-callback`
   - This route skips auth (so SignalHire can POST to it)

3. **Check logs:**
   - Render Dashboard → your service → **Logs** tab
   - You should see:
     ```
     [Render] Step 1/3: Starting SSH tunnel...
     ✓ SSH Connection established!
     ✓ Tunnel Ready! Listening on 0.0.0.0:3307
     [Render] Step 2/3: Starting n8n on internal port 5678...
     [Render] Step 3/3: Starting OAuth2 Proxy on port 10000...
     ```

---

## How Auth Works

| What happens | Details |
|-------------|---------|
| User visits any `/webhook/*` page | OAuth2 Proxy checks for auth cookie |
| **Not logged in** | Redirected to Google Sign-In |
| **Wrong email domain** | Denied by OAuth2 Proxy (only insightstap.com & sdtcdigital.com) |
| **Logged in** | Request proxied to n8n, page loads normally |
| **SignalHire callback** | Skips auth (route is whitelisted), data flows directly to n8n |
| **Cookie duration** | Default 168 hours (7 days), then re-login required |

---

## Routes That Skip Auth

These routes are accessible without Google login (needed for API callbacks and AJAX):

- `/webhook/signalhire-callback` — SignalHire sends enriched data here
- `/webhook/jobs-ui-data` — AJAX data loading for Jobs page
- `/webhook/jobs-ui-submit` — Form submission from Jobs page
- `/webhook/enrich-submit` — Enrichment request submission

---

## Troubleshooting

### "redirect_uri_mismatch" error
→ Go to Google Cloud Console and add your exact Render URL + `/oauth2/callback` to Authorized redirect URIs.

### OAuth2 Proxy won't start
→ Check that `GOOGLE_CLIENT_SECRET` and `OAUTH2_COOKIE_SECRET` are set in Render environment variables.

### n8n editor not accessible
→ The n8n editor at `/` may require separate handling. Access it at `https://gtm-tool.onrender.com/` after authenticating.

### SignalHire callback not working
→ Check Render logs for incoming POST requests to `/webhook/signalhire-callback`. The route should skip auth.

### SSH tunnel keeps reconnecting
→ Check that `SSH_PRIVATE_KEY` is correctly base64-encoded in Render env vars.

---

## Cost

| Component | Cost |
|-----------|------|
| Render Standard Plan | $7/month |
| Google OAuth2 | Free |
| OAuth2 Proxy | Free (open source) |
| **Total** | **$7/month** |

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `Dockerfile.render` | Docker image with n8n + oauth2-proxy + tunnel |
| `start_render.js` | Startup script that runs all 3 services |
| `render.yaml` | Render deployment config |
| `NewGTM.json` | Updated callback URL to use `WEBHOOK_URL` env var |
