# Use Node Alpine image
FROM node:20-alpine

# Install build tools for native modules
RUN apk add --no-cache python3 make g++ bash git

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the mobile app code
COPY . .

# Expose standard Expo ports
EXPOSE 19000 19001 19002

# Start the Expo development server
CMD ["npx", "expo", "start", "--tunnel"]