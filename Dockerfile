# Use Debian-based Node.js for better n8n compatibility
FROM node:20-bullseye-slim

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install n8n globally
RUN npm install -g n8n

# Create app directory for tunnel
WORKDIR /tunnel

# Copy tunnel files
COPY package.json ./
COPY start_tunnel.js ./
COPY start_combined.js ./

# Install tunnel dependencies
RUN npm install

# Set working directory
WORKDIR /home/node

# Expose n8n port
EXPOSE 5678

# Start both tunnel and n8n
CMD ["node", "/tunnel/start_combined.js"]
