# Dockerfile.render
# Runs: SSH Tunnel + n8n + OAuth2 Proxy (all in one container for Render)
# OAuth2 Proxy handles Google auth, then proxies to n8n on internal port 5678
# Render exposes the OAuth2 Proxy port (4180) as the public port

FROM node:20-bullseye-slim

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install oauth2-proxy
RUN curl -L https://github.com/oauth2-proxy/oauth2-proxy/releases/download/v7.7.1/oauth2-proxy-v7.7.1.linux-amd64.tar.gz \
    | tar xz --strip-components=1 -C /usr/local/bin/ oauth2-proxy-v7.7.1.linux-amd64/oauth2-proxy \
    && chmod +x /usr/local/bin/oauth2-proxy

# Install n8n globally
RUN npm install -g n8n

# Create app directory for tunnel
WORKDIR /tunnel

# Copy tunnel files
COPY package.json ./
COPY start_tunnel.js ./
COPY start_render.js ./

# Install tunnel dependencies
RUN npm install

# Set working directory for n8n
WORKDIR /home/node

# Render uses PORT env var — oauth2-proxy will listen on this
# n8n runs internally on 5678
EXPOSE 5678

# Start everything
CMD ["node", "/tunnel/start_render.js"]
