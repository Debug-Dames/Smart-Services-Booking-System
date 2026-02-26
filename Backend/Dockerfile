# Use Debian-based Node 20 LTS
FROM node:20

# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 make g++ bash git && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]