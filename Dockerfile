# Base image: n8n (Debian-based)
FROM n8nio/n8n:latest

# Switch to root to install dependencies
USER root

# Create app directory for tunnel
WORKDIR /tunnel

# Copy tunnel files
COPY package.json ./
COPY start_tunnel.js ./
COPY start_combined.js ./

# Install tunnel dependencies
RUN npm install

# Switch back to node user for security
USER node

# Set working directory back to n8n
WORKDIR /home/node

# Expose n8n port
EXPOSE 5678

# Start both tunnel and n8n using Node.js
CMD ["node", "/tunnel/start_combined.js"]
