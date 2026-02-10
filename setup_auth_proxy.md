# Google OAuth2 Proxy Setup for n8n GTM Tool

## Architecture
```
Browser (localhost:4180) → OAuth2 Proxy → n8n (localhost:5678)
                              ↓
                    Not logged in? → Google Sign-In
                    Logged in? → Pass through to n8n
```

Users access the tool at `http://localhost:4180` instead of `http://localhost:5678`.
OAuth2 Proxy handles Google authentication, then proxies requests to n8n.

---

## Option A: Docker (Recommended)

### Prerequisites
- Docker Desktop installed
- n8n running locally on port 5678

### Step 1: Get Google OAuth2 Client Secret

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID (`447046445190-al88jt66ddfi8qe18v9m4n3bkticfqbf`)
3. Copy the **Client Secret**
4. Add `http://localhost:4180/oauth2/callback` to **Authorized redirect URIs**
5. Add `http://localhost:4180` to **Authorized JavaScript origins**

### Step 2: Create .env file

Create a `.env` file in the NewGTM folder:

```env
GOOGLE_CLIENT_SECRET=your-client-secret-here
COOKIE_SECRET=generate-with-command-below
```

Generate COOKIE_SECRET:
```bash
python3 -c "import os,base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
```

### Step 3: Start OAuth2 Proxy

```bash
cd NewGTM
docker compose -f docker-compose.auth.yml up -d
```

### Step 4: Access the tool

Open `http://localhost:4180/webhook/jobs-ui` — you'll be redirected to Google Sign-In.
Only @insightstap.com and @sdtcdigital.com emails will be allowed.

---

## Option B: Standalone Binary (No Docker)

### Step 1: Download oauth2-proxy

**Windows:**
```powershell
# Download from https://github.com/oauth2-proxy/oauth2-proxy/releases
# Get the Windows AMD64 zip file, extract oauth2-proxy.exe
```

**Mac:**
```bash
brew install oauth2-proxy
```

### Step 2: Configure Google OAuth2

Same as Option A Step 1 — add redirect URI `http://localhost:4180/oauth2/callback`

### Step 3: Run oauth2-proxy

```bash
oauth2-proxy \
  --provider=google \
  --client-id=447046445190-al88jt66ddfi8qe18v9m4n3bkticfqbf.apps.googleusercontent.com \
  --client-secret=YOUR_CLIENT_SECRET \
  --cookie-secret=YOUR_COOKIE_SECRET \
  --cookie-secure=false \
  --email-domain=insightstap.com \
  --email-domain=sdtcdigital.com \
  --upstream=http://localhost:5678/ \
  --http-address=0.0.0.0:4180 \
  --redirect-url=http://localhost:4180/oauth2/callback \
  --skip-auth-route="^/webhook/signalhire-callback$" \
  --skip-auth-route="^/webhook/jobs-ui-data" \
  --skip-auth-route="^/webhook/enrich-submit$" \
  --skip-auth-route="^/webhook/jobs-ui-submit$"
```

### Step 4: Access

Open `http://localhost:4180/webhook/jobs-ui`

---

## Important: Update SignalHire Callback URL

When using the proxy, the callback URL in your n8n workflow should point to the **public URL**
(when you eventually deploy). For local dev, SignalHire still can't reach localhost.

For production:
1. Deploy behind a domain (e.g., `https://gtm.yourdomain.com`)
2. Update the callback URL in the "Process Enrich Request" node to:
   `https://gtm.yourdomain.com/webhook/signalhire-callback`
3. Add `/webhook/signalhire-callback` to the skip-auth-routes so SignalHire can POST without auth

---

## Routes Summary

| Route | Auth Required | Description |
|-------|--------------|-------------|
| `/webhook/jobs-ui` | ✅ Yes | Jobs selection page |
| `/webhook/leaders-ui/*` | ✅ Yes | Leaders/people page |
| `/webhook/enriched-ui` | ✅ Yes | Enriched data page |
| `/webhook/signalhire-callback` | ❌ No | SignalHire callback |
| `/webhook/jobs-ui-data` | ❌ No | AJAX data endpoint |
| `/webhook/jobs-ui-submit` | ❌ No | Form submit endpoint |
| `/webhook/enrich-submit` | ❌ No | Enrich request endpoint |
