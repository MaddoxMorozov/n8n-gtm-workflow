# Base image: n8n
FROM n8nio/n8n:latest

# Switch to root to install dependencies
USER root

# Install Node.js dependencies for the SSH tunnel
RUN apk add --no-cache openssh-client

# Create app directory for tunnel
WORKDIR /tunnel

# Copy tunnel files
COPY package.json ./
COPY start_tunnel.js ./
COPY start.sh ./

# Install tunnel dependencies
RUN npm install

# Make start script executable
RUN chmod +x start.sh

# Switch back to node user for security
USER node

# Set working directory back to n8n
WORKDIR /home/node

# Expose n8n port
EXPOSE 5678

# Start both tunnel and n8n
CMD ["/tunnel/start.sh"]
