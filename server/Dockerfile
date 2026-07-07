FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install build dependencies for compiling better-sqlite3 native binary
RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 && rm -rf /var/lib/apt/lists/*

# Install dependencies (only production)
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Run server
CMD ["node", "server.js"]
