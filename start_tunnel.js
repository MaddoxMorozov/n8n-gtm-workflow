const { Client } = require('ssh2');
const net = require('net');

// Configuration from environment variables (for Render deployment)
// Or fallback to hardcoded values for local development
const SSH_HOST = process.env.SSH_HOST || '173.212.247.135';
const SSH_PORT = parseInt(process.env.SSH_PORT || '22');
const SSH_USERNAME = process.env.SSH_USERNAME || 'root';

// SSH private key can be passed as environment variable (base64 encoded) or read from file
let privateKey;
if (process.env.SSH_PRIVATE_KEY) {
    // Decode base64 if it looks encoded, otherwise use as-is
    const keyData = process.env.SSH_PRIVATE_KEY;
    if (keyData.startsWith('LS0t')) {
        privateKey = Buffer.from(keyData, 'base64').toString('utf-8');
    } else {
        privateKey = keyData;
    }
} else {
    // Local development fallback
    const fs = require('fs');
    const keyPath = process.env.SSH_KEY_PATH || 'C:\\Users\\Maddox\\.ssh\\id_rsa_mysql';
    privateKey = fs.readFileSync(keyPath);
}

const SSH_CONFIG = {
    host: SSH_HOST,
    port: SSH_PORT,
    username: SSH_USERNAME,
    privateKey: privateKey,
    keepaliveInterval: 10000, // Send keepalive every 10 seconds
    keepaliveCountMax: 3,
    readyTimeout: 20000,
};

const LOCAL_PORT = parseInt(process.env.PORT || process.env.LOCAL_PORT || '3307');
const REMOTE_HOST = process.env.REMOTE_HOST || '127.0.0.1';
const REMOTE_PORT = parseInt(process.env.REMOTE_PORT || '3306');

let conn = new Client();
let server = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

function connect() {
    console.log(`[${new Date().toISOString()}] Connecting to SSH server ${SSH_HOST}:${SSH_PORT}...`);
    
    conn = new Client();
    
    conn.on('ready', () => {
        console.log(`[${new Date().toISOString()}] ✓ SSH Connection established!`);
        reconnectAttempts = 0;

        // Create a local server to forward traffic
        server = net.createServer((socket) => {
            conn.forwardOut(
                '127.0.0.1',
                socket.remotePort,
                REMOTE_HOST,
                REMOTE_PORT,
                (err, stream) => {
                    if (err) {
                        console.error(`[${new Date().toISOString()}] SSH Forward Error:`, err.message);
                        socket.end();
                        return;
                    }
                    socket.pipe(stream);
                    stream.pipe(socket);
                    
                    stream.on('close', () => socket.destroy());
                    socket.on('close', () => stream.destroy());
                }
            );
        });

        server.listen(LOCAL_PORT, '0.0.0.0', () => {
            console.log(`[${new Date().toISOString()}] ✓ Tunnel Ready! Listening on 0.0.0.0:${LOCAL_PORT}`);
            console.log(`  Forwarding to ${REMOTE_HOST}:${REMOTE_PORT}`);
            console.log('  (Process will auto-reconnect on disconnect)');
        });

        server.on('error', (err) => {
            console.error(`[${new Date().toISOString()}] Tunnel Server Error:`, err.message);
            cleanup();
        });
    });

    conn.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] SSH Connection Error:`, err.message);
        scheduleReconnect();
    });

    conn.on('close', () => {
        console.log(`[${new Date().toISOString()}] SSH Connection closed.`);
        scheduleReconnect();
    });

    conn.on('end', () => {
        console.log(`[${new Date().toISOString()}] SSH Connection ended.`);
    });

    conn.connect(SSH_CONFIG);
}

function cleanup() {
    if (server) {
        server.close();
        server = null;
    }
    if (conn) {
        conn.end();
    }
}

function scheduleReconnect() {
    cleanup();
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`[${new Date().toISOString()}] Max reconnection attempts reached. Exiting.`);
        process.exit(1);
    }
    
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
    console.log(`[${new Date().toISOString()}] Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    setTimeout(connect, delay);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n[${new Date().toISOString()}] Shutting down...`);
    cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(`[${new Date().toISOString()}] Received SIGTERM. Shutting down...`);
    cleanup();
    process.exit(0);
});

// Start the tunnel
connect();
