#!/bin/sh

# Start the SSH tunnel in the background
echo "Starting SSH tunnel..."
node /tunnel/start_tunnel.js &
TUNNEL_PID=$!

# Wait a few seconds for tunnel to establish
sleep 5

# Start n8n
echo "Starting n8n..."
n8n start

# If n8n exits, also kill the tunnel
kill $TUNNEL_PID 2>/dev/null
