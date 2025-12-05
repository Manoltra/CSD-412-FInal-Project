# Security Configuration for Expense Tracker

## Security Headers Middleware

Add this to your Express server to enhance security:

```javascript
// middleware/securityHeaders.js
function securityHeaders(req, res, next) {
    // HSTS (HTTP Strict Transport Security)
    res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Clickjacking protection
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
    );

    // Disable caching for sensitive content
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    next();
}

module.exports = securityHeaders;
```

## SSL/TLS Configuration

```javascript
// config/httpsOptions.js
const fs = require('fs');
const path = require('path');

function getSSLOptions() {
    const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../certs/server.crt');
    const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../certs/server.key');

    try {
        return {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
            // TLS 1.2 minimum
            minVersion: 'TLSv1.2',
            // Strong cipher suites
            ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256'
        };
    } catch (error) {
        console.error('SSL/TLS configuration error:', error.message);
        return null;
    }
}

module.exports = { getSSLOptions };
```

## HTTPS Redirect Middleware

```javascript
// middleware/httpsRedirect.js
function httpsRedirect(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
        // Check if request is via HTTPS
        const proto = req.header('x-forwarded-proto') || req.protocol;
        
        if (proto === 'http') {
            return res.redirect(301, `https://${req.header('host')}${req.url}`);
        }
    }
    next();
}

module.exports = httpsRedirect;
```

## Certificate Monitoring

```javascript
// utils/certificateMonitor.js
const fs = require('fs');
const path = require('path');

class CertificateMonitor {
    constructor(certPath) {
        this.certPath = certPath;
        this.warningDays = 30; // Warn if cert expires within 30 days
    }

    checkCertificateExpiration() {
        try {
            const { execSync } = require('child_process');
            const certPath = process.env.SSL_CERT_PATH || this.certPath;
            
            // Get certificate expiration date
            const expirationDate = execSync(
                `openssl x509 -enddate -noout -in ${certPath}`,
                { encoding: 'utf-8' }
            );

            const dateMatch = expirationDate.match(/notAfter=(.+)/);
            if (!dateMatch) return null;

            const expiry = new Date(dateMatch[1]);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

            return {
                expiryDate: expiry.toISOString(),
                daysUntilExpiry,
                isExpired: daysUntilExpiry < 0,
                needsRenewal: daysUntilExpiry < this.warningDays
            };
        } catch (error) {
            console.error('Certificate check error:', error.message);
            return null;
        }
    }

    startMonitoring() {
        // Check certificate every day
        setInterval(() => {
            const status = this.checkCertificateExpiration();
            
            if (status) {
                if (status.isExpired) {
                    console.error('❌ SSL CERTIFICATE EXPIRED!');
                    console.error(`Expiry Date: ${status.expiryDate}`);
                } else if (status.needsRenewal) {
                    console.warn('⚠️  SSL CERTIFICATE RENEWAL NEEDED');
                    console.warn(`Days until expiry: ${status.daysUntilExpiry}`);
                    console.warn(`Expiry Date: ${status.expiryDate}`);
                } else {
                    console.log(`✅ Certificate valid for ${status.daysUntilExpiry} more days`);
                }
            }
        }, 24 * 60 * 60 * 1000); // 24 hours
    }
}

module.exports = CertificateMonitor;
```

## Complete Server Configuration

```javascript
// server.js with security
const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');

const app = express();

// Import security middleware
const securityHeaders = require('./middleware/securityHeaders');
const httpsRedirect = require('./middleware/httpsRedirect');
const { getSSLOptions } = require('./config/httpsOptions');
const CertificateMonitor = require('./utils/certificateMonitor');

// Apply security middleware
app.use(httpsRedirect);
app.use(securityHeaders);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// CORS configuration
const cors = require('cors');
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Server error',
        status: err.status || 500
    });
});

// Start servers
function startServers() {
    const PORT = process.env.PORT || 5000;
    const USE_HTTPS = process.env.USE_HTTPS === 'true' || process.env.NODE_ENV === 'production';

    if (USE_HTTPS) {
        const sslOptions = getSSLOptions();
        
        if (sslOptions) {
            // Start HTTPS server
            https.createServer(sslOptions, app).listen(443, () => {
                console.log('🔒 HTTPS Server running on port 443');
            });

            // Start HTTP redirect server
            http.createServer((req, res) => {
                res.writeHead(301, {
                    Location: `https://${req.headers.host}${req.url}`
                });
                res.end();
            }).listen(80, () => {
                console.log('↪️  HTTP Server redirecting to HTTPS on port 80');
            });

            // Monitor certificate expiration
            const certMonitor = new CertificateMonitor(process.env.SSL_CERT_PATH);
            certMonitor.startMonitoring();
        } else {
            console.warn('⚠️  HTTPS enabled but certificates not found. Using HTTP.');
            startHTTP(PORT);
        }
    } else {
        startHTTP(PORT);
    }
}

function startHTTP(port) {
    app.listen(port, () => {
        console.log(`✅ HTTP Server running on http://localhost:${port}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServers();

module.exports = app;
```

## Environment Variables for Production

Create `.env.production`:

```bash
NODE_ENV=production
USE_HTTPS=true
PORT=443

# SSL Certificate paths
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_NAME=expense_tracker

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_with_long_random_string

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

## AWS Security Group Configuration

For your EC2 instance, allow:

```
Inbound Rules:
- HTTPS (443) from 0.0.0.0/0
- HTTP (80) from 0.0.0.0/0
- SSH (22) from your-ip/32

Outbound Rules:
- All traffic (default)
```

## Certificate Renewal with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Renew certificate
sudo certbot renew --nginx

# Auto-renewal (runs daily)
sudo certbot renew --quiet

# Verify auto-renewal works
sudo certbot renew --dry-run
```

## Testing Security Configuration

```bash
# Check SSL/TLS version
curl -I https://yourdomain.com --tlsv1.2

# Check security headers
curl -I https://yourdomain.com

# Run security scan
npm install -g retire
retire --js --jshint

# SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/
```

Your Expense Tracker is now fully secured with HTTPS, security headers, and certificate monitoring! 🔒
