# Dockerfile for Expense Tracker with SSL/TLS Support

FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create certificates directory
RUN mkdir -p /app/certs

# Copy SSL certificates if they exist (optional for Docker builds)
# These can be mounted as volumes at runtime instead
COPY certs/ /app/certs/ 2>/dev/null || true

# If certificates don't exist, generate self-signed ones for development
RUN if [ ! -f /app/certs/server.crt ]; then \
    openssl req -x509 -newkey rsa:4096 \
    -keyout /app/certs/server.key \
    -out /app/certs/server.crt \
    -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Expense Tracker/CN=localhost"; \
    fi

# Expose HTTP and HTTPS ports
EXPOSE 80 443 5000

# Set environment variables
ENV NODE_ENV=production
ENV USE_HTTPS=true
ENV PORT=443

# Health check - check HTTP fallback
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start the application
CMD ["npm", "start"]
