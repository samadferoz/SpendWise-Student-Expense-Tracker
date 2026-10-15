# Use official Node 22 Alpine lightweight base image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies cleanly
RUN npm ci --only=production

# Copy application source code (excluding items in .dockerignore)
COPY src/ ./src/

# Expose backend API port
EXPOSE 5000

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start backend Express server
CMD ["node", "src/server.js"]
