// start_render.js
// Starts all 3 services for Render deployment:
//   1. SSH Tunnel (connects to remote MySQL)
//   2. n8n (workflow engine, internal port 5678)
//   3. OAuth2 Proxy (Google auth, public port from Render's PORT env var)

const { spawn, fork } = require('child_process');
const path = require('path');

// Render provides PORT env var — oauth2-proxy listens on this
const PUBLIC_PORT = process.env.PORT || '10000';
const N8N_PORT = '5678';

// Required env vars (set in Render dashboard):
//   GOOGLE_CLIENT_ID        - Google OAuth2 client ID
//   GOOGLE_CLIENT_SECRET    - Google OAuth2 client secret
//   OAUTH2_COOKIE_SECRET    - Random 32-byte base64 string
//   RENDER_EXTERNAL_URL     - e.g. https://your-app.onrender.com (set automatically by Render)
//   SSH_HOST, SSH_PORT, SSH_USERNAME, SSH_PRIVATE_KEY - for MySQL tunnel
//   ALLOWED_EMAIL_DOMAINS   - comma-separated, e.g. "insightstap.com,sdtcdigital.com"

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PUBLIC_PORT}`;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '447046445190-al88jt66ddfi8qe18v9m4n3bkticfqbf.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const COOKIE_SECRET = process.env.OAUTH2_COOKIE_SECRET;
const EMAIL_DOMAINS = process.env.ALLOWED_EMAIL_DOMAINS || 'insightstap.com,sdtcdigital.com';

if (!CLIENT_SECRET) {
  console.error('[FATAL] GOOGLE_CLIENT_SECRET is not set. Set it in Render dashboard.');
  process.exit(1);
}
if (!COOKIE_SECRET) {
  console.error('[FATAL] OAUTH2_COOKIE_SECRET is not set. Generate one with:');
  console.error('  python3 -c "import os,base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"');
  process.exit(1);
}

// =============================================
// Step 1: Start SSH Tunnel
// =============================================
console.log('[Render] Step 1/3: Starting SSH tunnel...');
const tunnelPath = path.join(__dirname, 'start_tunnel.js');
const tunnel = fork(tunnelPath, [], {
  env: process.env,
  stdio: 'inherit'
});

tunnel.on('error', (err) => {
  console.error('[Render] Tunnel error:', err.message);
});

// =============================================
// Step 2: Start n8n (after tunnel has time to connect)
// =============================================
setTimeout(() => {
  console.log('[Render] Step 2/3: Starting n8n on internal port ' + N8N_PORT + '...');

  const n8n = spawn('npx', ['n8n'], {
    env: {
      ...process.env,
      N8N_PORT: N8N_PORT,
      N8N_HOST: '0.0.0.0',
      // Tell n8n its public URL goes through the proxy
      WEBHOOK_URL: RENDER_URL + '/',
      N8N_EDITOR_BASE_URL: RENDER_URL + '/',
    },
    stdio: 'inherit',
    shell: true
  });

  n8n.on('error', (err) => {
    console.error('[Render] n8n error:', err.message);
    process.exit(1);
  });

  n8n.on('close', (code) => {
    console.log('[Render] n8n exited with code:', code);
    cleanup();
    process.exit(code || 1);
  });

  // =============================================
  // Step 3: Start OAuth2 Proxy (after n8n has time to start)
  // =============================================
  setTimeout(() => {
    console.log('[Render] Step 3/3: Starting OAuth2 Proxy on port ' + PUBLIC_PORT + '...');
    console.log('[Render] Public URL: ' + RENDER_URL);
    console.log('[Render] Allowed domains: ' + EMAIL_DOMAINS);

    const emailDomainArgs = EMAIL_DOMAINS.split(',').flatMap(d => ['--email-domain', d.trim()]);

    const proxy = spawn('oauth2-proxy', [
      '--provider=google',
      '--client-id=' + CLIENT_ID,
      '--client-secret=' + CLIENT_SECRET,
      '--cookie-secret=' + COOKIE_SECRET,
      '--cookie-secure=true',
      '--cookie-name=_gtm_auth',

      // Email domain restrictions
      ...emailDomainArgs,

      // Upstream = internal n8n
      '--upstream=http://127.0.0.1:' + N8N_PORT + '/',

      // Listen on Render's PORT
      '--http-address=0.0.0.0:' + PUBLIC_PORT,

      // Redirect URL (Google sends user back here after login)
      '--redirect-url=' + RENDER_URL + '/oauth2/callback',

      // Skip auth for these routes (SignalHire callback + AJAX endpoints)
      '--skip-auth-route=^/webhook/signalhire-callback',
      '--skip-auth-route=^/webhook/jobs-ui-data',
      '--skip-auth-route=^/webhook/jobs-ui-submit',
      '--skip-auth-route=^/webhook/enrich-submit',

      // Pass user info to n8n as headers
      '--set-xauthrequest=true',
      '--pass-user-headers=true',

      // Reverse proxy mode
      '--reverse-proxy=true',

      // Logging
      '--standard-logging=true',
      '--request-logging=true',
    ], {
      stdio: 'inherit'
    });

    proxy.on('error', (err) => {
      console.error('[Render] OAuth2 Proxy error:', err.message);
      process.exit(1);
    });

    proxy.on('close', (code) => {
      console.log('[Render] OAuth2 Proxy exited with code:', code);
      cleanup();
      process.exit(code || 1);
    });

    global._proxy = proxy;
    global._n8n = n8n;

  }, 10000); // Wait 10s for n8n to start

}, 5000); // Wait 5s for tunnel

// =============================================
// Cleanup
// =============================================
function cleanup() {
  console.log('[Render] Shutting down...');
  if (global._proxy) try { global._proxy.kill(); } catch(e) {}
  if (global._n8n) try { global._n8n.kill(); } catch(e) {}
  if (tunnel) try { tunnel.kill(); } catch(e) {}
}

process.on('SIGTERM', () => { cleanup(); process.exit(0); });
process.on('SIGINT', () => { cleanup(); process.exit(0); });
