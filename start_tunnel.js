const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const net = require('net');

// Configuration
const SSH_CONFIG = {
    host: '173.212.247.135',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync('C:\\Users\\Maddox\\.ssh\\id_rsa_mysql'),
    // debug: console.log
};

const LOCAL_PORT = 3307;
const REMOTE_HOST = '127.0.0.1'; // Remote database is on localhost relative to the server
const REMOTE_PORT = 3306;

const conn = new Client();

console.log('Connecting to SSH server...');

conn.on('ready', () => {
    console.log('✓ SSH Connection established!');

    // Create a local server to forward traffic
    const server = net.createServer((socket) => {
        conn.forwardOut(
            '127.0.0.1',
            socket.remotePort,
            REMOTE_HOST,
            REMOTE_PORT,
            (err, stream) => {
                if (err) {
                    console.error('SSH Forward Error:', err);
                    socket.end();
                    return;
                }
                // Pipe data between local socket and remote stream
                socket.pipe(stream);
                stream.pipe(socket);
            }
        );
    });

    server.listen(LOCAL_PORT, '0.0.0.0', () => {
        console.log(`✓ Tunnel Ready! Listening on 0.0.0.0:${LOCAL_PORT}`);
        console.log('  \nFor n8n (running in Docker):');
        console.log(`  - Host: host.docker.internal`);
        console.log(`  - Port: ${LOCAL_PORT}`);
        console.log('  \nFor local apps:');
        console.log(`  - Host: 127.0.0.1`);
        console.log(`  - Port: ${LOCAL_PORT}`);
        console.log('  (Press Ctrl+C to stop)');
    });

    server.on('error', (err) => {
        console.error('Tunnel Server Error:', err);
        conn.end();
    });

}).on('error', (err) => {
    console.error('SSH Connection Error:', err);
    console.log('\nMake sure the key C:\\Users\\Maddox\\.ssh\\id_rsa_mysql exists and is correct.');
}).connect(SSH_CONFIG);
