# Base image: n8n
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

# Set working directory back to n8n
WORKDIR /home/node

# Expose n8n port
EXPOSE 5678

# Stay as root to have proper PATH - n8n will switch user internally if needed
# Use full path to node
CMD ["/usr/local/bin/node", "/tunnel/start_combined.js"]
