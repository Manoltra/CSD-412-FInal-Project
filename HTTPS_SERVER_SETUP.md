# HTTPS Server Implementation Guide

## Quick Start - Development

### 1. Generate Self-Signed Certificate (Windows PowerShell)

```powershell
# Generate certificate valid for 365 days
$cert = New-SelfSignedCertificate -CertStoreLocation "cert:\CurrentUser\My" `
  -DnsName "localhost", "127.0.0.1" `
  -FriendlyName "Expense Tracker Dev" `
  -NotAfter (Get-Date).AddDays(365)

# Export certificate as PEM for Node.js
Export-Certificate -Cert $cert -FilePath ".\certs\server.crt" -Type CERT
$certPath = "Cert:\CurrentUser\My\$($cert.Thumbprint)"
Export-PfxCertificate -Cert $certPath -FilePath ".\certs\server.pfx" -Password (ConvertTo-SecureString -String "password" -AsPlainText -Force)
```

**Or use OpenSSL (if installed):**

```bash
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj "/CN=localhost"
```

### 2. Create server.js with HTTPS Support

```javascript
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Add security headers
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// Start HTTPS Server
function startServer() {
    const PORT = process.env.PORT || 5000;
    const USE_HTTPS = process.env.USE_HTTPS === 'true' || process.env.NODE_ENV === 'production';

    if (USE_HTTPS) {
        try {
            const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../certs/server.crt');
            const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../certs/server.key');

            if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
                console.warn('SSL certificates not found. Using HTTP only.');
                return startHTTP(PORT);
            }

            const options = {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath)
            };

            https.createServer(options, app).listen(443, () => {
                console.log('🔒 HTTPS Server running on port 443');
            });

            // Redirect HTTP to HTTPS
            http.createServer((req, res) => {
                res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
                res.end();
            }).listen(80, () => {
                console.log('↪️  HTTP Server redirecting to HTTPS on port 80');
            });
        } catch (error) {
            console.error('Error starting HTTPS server:', error);
            startHTTP(PORT);
        }
    } else {
        startHTTP(PORT);
    }
}

function startHTTP(port) {
    app.listen(port, () => {
        console.log(`✅ HTTP Server running on http://localhost:${port}`);
    });
}

startServer();

module.exports = app;
```

### 3. Update package.json

```json
{
  "name": "expense-tracker",
  "version": "1.0.0",
  "description": "Expense Tracker Web Application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "USE_HTTPS=false nodemon server.js",
    "https": "USE_HTTPS=true node server.js",
    "prod": "NODE_ENV=production node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.0",
    "mysql2": "^3.2.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

### 4. Environment Configuration (.env)

```bash
# Development
NODE_ENV=development
PORT=5000
USE_HTTPS=false

# Production
# NODE_ENV=production
# PORT=443
# USE_HTTPS=true
# SSL_CERT_PATH=/path/to/server.crt
# SSL_KEY_PATH=/path/to/server.key

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=expense_tracker

# JWT
JWT_SECRET=your_jwt_secret_key_here

# CORS
CORS_ORIGIN=*
```

### 5. Docker Configuration

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Create certs directory
RUN mkdir -p /app/certs

# Copy SSL certificates (if they exist)
COPY certs/ /app/certs/ 2>/dev/null || true

# Expose ports
EXPOSE 80 443

# Set production environment
ENV NODE_ENV=production
ENV USE_HTTPS=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('https').get('https://localhost', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  expense-tracker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: expense-tracker
    ports:
      - "80:80"     # HTTP (redirects to HTTPS)
      - "443:443"   # HTTPS
    volumes:
      - ./certs:/app/certs:ro  # Mount certificates (read-only)
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - USE_HTTPS=true
      - SSL_CERT_PATH=/app/certs/server.crt
      - SSL_KEY_PATH=/app/certs/server.key
      - JWT_SECRET=${JWT_SECRET}
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
    networks:
      - expense-network
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: expense-tracker-db
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - expense-network
    restart: unless-stopped

networks:
  expense-network:
    driver: bridge

volumes:
  mysql-data:
```

### 6. AWS Deployment with ACM

#### Using AWS Application Load Balancer:

```yaml
# CloudFormation Template (simplified)
Resources:
  ExpenseTrackerALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: expense-tracker-alb
      Type: application
      Listeners:
        - Protocol: HTTPS
          Port: 443
          Certificates:
            - CertificateArn: arn:aws:acm:region:account:certificate/your-cert-id
          DefaultActions:
            - Type: forward
              TargetGroupArn: !Ref TargetGroup
        - Protocol: HTTP
          Port: 80
          DefaultActions:
            - Type: redirect
              RedirectConfig:
                Protocol: HTTPS
                Port: "443"
                StatusCode: HTTP_301

  TargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: 5000
      Protocol: HTTP
      HealthCheckEnabled: true
      HealthCheckPath: /
```

### 7. Testing HTTPS Connection

```bash
# Test certificate
curl -k https://localhost

# Verify certificate details
openssl s_client -connect localhost:443

# Check certificate expiration
openssl x509 -in certs/server.crt -text -noout
```

### 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 443 requires admin | Use port 8443 or run with sudo |
| Certificate not found | Ensure certs directory exists and contains server.crt and server.key |
| Self-signed cert warning | Normal for dev - browsers show warning, use `-k` flag in curl |
| CORS errors on HTTPS | Add CORS headers and use same protocol |

## Summary

Your Expense Tracker now has:
✅ HTTPS/SSL support
✅ Automatic HTTP to HTTPS redirect
✅ Security headers
✅ Docker containerization
✅ AWS deployment ready
✅ Development and production modes
