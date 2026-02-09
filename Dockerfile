# Use standard Node.js image (has proper node/npm paths)
FROM node:18-alpine

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
