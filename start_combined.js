// start_combined.js - Starts both SSH tunnel and n8n
const { spawn, fork } = require('child_process');
const path = require('path');

console.log('[Combined] Starting SSH tunnel...');

// Start the tunnel
const tunnelPath = path.join(__dirname, 'start_tunnel.js');
const tunnel = fork(tunnelPath, [], {
  env: process.env,
  stdio: 'inherit'
});

// Wait for tunnel to establish
setTimeout(() => {
  console.log('[Combined] Starting n8n...');
  
  // Start n8n
  const n8n = spawn('n8n', ['start'], {
    env: process.env,
    stdio: 'inherit'
  });

  n8n.on('error', (err) => {
    console.error('[Combined] n8n error:', err);
    process.exit(1);
  });

  n8n.on('close', (code) => {
    console.log('[Combined] n8n exited with code:', code);
    tunnel.kill();
    process.exit(code);
  });

}, 5000); // Wait 5 seconds for tunnel

// Handle process termination
process.on('SIGTERM', () => {
  console.log('[Combined] Received SIGTERM, shutting down...');
  tunnel.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Combined] Received SIGINT, shutting down...');
  tunnel.kill();
  process.exit(0);
});
