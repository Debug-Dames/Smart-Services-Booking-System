# ======================
# Build Stage
# ======================
FROM node:20-slim AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Optional: build-time environment variables for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite app
RUN npm run build

# ======================
# Serve Stage
# ======================
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy build output from build stage
COPY --from=build /app/dist ./dist

# Expose port 80
EXPOSE 80

# Start server
CMD ["serve", "-s", "dist", "-l", "80"]

