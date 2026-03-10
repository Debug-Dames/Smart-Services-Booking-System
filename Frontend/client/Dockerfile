# Build stage
FROM node:20-bullseye AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (more forgiving)
RUN npm install

# Copy source code
COPY . .

# Optional Vite env variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite app
RUN npm run build