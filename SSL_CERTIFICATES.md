# SSL/TLS Certificate Setup Guide for Expense Tracker

## Overview
This document provides instructions for setting up valid SSL/TLS certificates for the Expense Tracker Web Application to enable HTTPS.

## Options for Certificate Setup

### 1. **Development Environment (Self-Signed Certificate)**

For local testing and development, use a self-signed certificate:

```bash
# Generate a self-signed certificate valid for 365 days
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes

# When prompted, enter:
# Country: US
# State: [Your State]
# City: [Your City]
# Organization: Expense Tracker
# Common Name: localhost
```

Save the generated files in your project:
- `server.crt` - Certificate file
- `server.key` - Private key file

### 2. **Production Environment (AWS)**

#### Option A: AWS Certificate Manager (ACM) - Recommended
1. Go to AWS Certificate Manager
2. Request a certificate for your domain
3. AWS automatically manages certificate renewal
4. Works with ALB (Application Load Balancer), CloudFront, and more
5. **Cost**: Free

#### Option B: Let's Encrypt (Free)
1. Use Certbot with your domain
2. Generates certificates automatically
3. Auto-renews every 90 days

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates stored in: /etc/letsencrypt/live/yourdomain.com/
```

#### Option C: Commercial Certificate Authority
- GoDaddy, Comodo, DigiCert, etc.
- Purchase an SSL certificate
- Follow their installation instructions

### 3. **Docker Configuration with Certificates**

#### Store certificates in Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy SSL certificates
COPY server.crt /app/certs/server.crt
COPY server.key /app/certs/server.key

EXPOSE 443 80

CMD ["node", "server.js"]
```

#### Create docker-compose.yml:

```yaml
version: '3.8'

services:
  expense-tracker:
    build: .
    ports:
      - "443:443"  # HTTPS
      - "80:80"    # HTTP (redirect to HTTPS)
    volumes:
      - ./certs:/app/certs  # Mount certificate directory
    environment:
      - NODE_ENV=production
      - SSL_CERT_PATH=/app/certs/server.crt
      - SSL_KEY_PATH=/app/certs/server.key
```

### 4. **Server Implementation (Node.js/Express)**

#### server.js with HTTPS:

```javascript
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});

// Your API routes here
app.use('/api', require('./routes/api'));

// HTTPS Configuration
if (process.env.NODE_ENV === 'production' || process.env.USE_HTTPS === 'true') {
    const options = {
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || './certs/server.crt'),
        key: fs.readFileSync(process.env.SSL_KEY_PATH || './certs/server.key')
    };
    
    https.createServer(options, app).listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
    
    // Also run HTTP server to redirect to HTTPS
    http.createServer(app).listen(80, () => {
        console.log('HTTP Server running on port 80 (redirecting to HTTPS)');
    });
} else {
    // Development: HTTP only
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`HTTP Server running on port ${PORT}`);
    });
}
```

### 5. **AWS Deployment Options**

#### Option 1: AWS ALB (Application Load Balancer)
```
Internet
    ↓
ALB (with ACM certificate) - Port 443 (HTTPS)
    ↓
EC2 Instance - Port 5000 (HTTP - internal)
```

Benefits:
- AWS manages certificate renewal
- Automatic HTTPS termination
- Load balancing

#### Option 2: Self-hosted with nginx
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 6. **Security Best Practices**

✅ **Always use HTTPS in production**
✅ **Enable HSTS (HTTP Strict Transport Security)**
✅ **Use TLS 1.2 or higher**
✅ **Keep certificates updated**
✅ **Use strong cipher suites**
✅ **Never commit private keys to GitHub**
✅ **Rotate certificates regularly**

### 7. **Certificate Verification Commands**

```bash
# Check certificate expiration
openssl x509 -in server.crt -text -noout

# Verify certificate and key match
openssl x509 -noout -modulus -in server.crt | openssl md5
openssl rsa -noout -modulus -in server.key | openssl md5

# View certificate details
openssl x509 -in server.crt -text -noout

# Verify chain (for commercial certificates)
openssl verify -CAfile ca.crt server.crt
```

### 8. **Frontend Configuration for HTTPS**

Your frontend already supports HTTPS! The `API_BASE_URL` configuration automatically handles it:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'        // Development (HTTP)
    : 'https://api.yourdomain.com/api';  // Production (HTTPS)
```

Or use relative paths for full HTTPS enforcement:
```javascript
const API_BASE_URL = '/api';  // Automatically uses HTTPS when served over HTTPS
```

## Recommended Setup for AWS Deployment

1. **Use AWS Certificate Manager (ACM)**
   - Free and automatically managed
   - Works seamlessly with ALB
   - Auto-renewal

2. **Deploy with ALB**
   - Terminate HTTPS at load balancer
   - Backend runs on HTTP (internal)
   - Simpler and more secure

3. **Environment Variables**
   ```bash
   SSL_CERT_PATH=/path/to/certificate.crt
   SSL_KEY_PATH=/path/to/private.key
   NODE_ENV=production
   ```

## Next Steps

1. Choose certificate option (AWS ACM recommended for production)
2. Generate or obtain certificates
3. Update server.js with HTTPS configuration
4. Deploy to AWS with proper security groups
5. Test HTTPS connection: `https://yourdomain.com`
6. Verify certificate in browser

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Certificate not found | Check file paths in environment variables |
| Port 443 already in use | Change port or stop conflicting service |
| Certificate expired | Renew or generate new certificate |
| Mixed content warning | Ensure all resources load over HTTPS |
| CORS issues | Add proper CORS headers to HTTPS responses |

## References

- [Let's Encrypt](https://letsencrypt.org/)
- [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
- [Node.js HTTPS Module](https://nodejs.org/en/docs/guides/nodejs-https-ssl-certificates/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
