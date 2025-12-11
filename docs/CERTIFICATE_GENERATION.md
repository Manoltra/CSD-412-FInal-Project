# Certificate Generation and Management Script

## Quick Certificate Generation

### For Development (Self-Signed)

#### Windows PowerShell:
```powershell
# Create certs directory
New-Item -ItemType Directory -Force -Path ".\certs"

# Generate self-signed certificate
$cert = New-SelfSignedCertificate -CertStoreLocation "cert:\CurrentUser\My" `
  -DnsName "localhost", "127.0.0.1" `
  -FriendlyName "Expense Tracker Dev" `
  -NotAfter (Get-Date).AddYears(1)

# Export certificate
$certPath = "Cert:\CurrentUser\My\$($cert.Thumbprint)"
Export-Certificate -Cert $cert -FilePath ".\certs\server.crt" -Type CERT

# Export private key
$password = ConvertTo-SecureString -String "password" -AsPlainText -Force
Export-PfxCertificate -Cert $certPath -FilePath ".\certs\server.pfx" -Password $password
```

#### Linux/Mac (using OpenSSL):
```bash
#!/bin/bash

# Create certs directory
mkdir -p certs

# Generate self-signed certificate (365 days validity)
openssl req -x509 -newkey rsa:4096 \
  -keyout certs/server.key \
  -out certs/server.crt \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=State/L=City/O=Expense Tracker/CN=localhost"

echo "✅ Self-signed certificate generated in ./certs/"
echo "   - server.crt"
echo "   - server.key"
```

### For Production (Let's Encrypt)

#### Linux (Certbot):
```bash
#!/bin/bash

DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly \
  --standalone \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -m "$EMAIL" \
  --agree-tos \
  --non-interactive

# Copy certificates to project
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./certs/server.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./certs/server.key
sudo chown $USER:$USER ./certs/*

echo "✅ Let's Encrypt certificate installed"
echo "   Renewal: sudo certbot renew --quiet"
```

#### For Renewal Automation:
```bash
#!/bin/bash

# Create renewal script
sudo tee /etc/letsencrypt/renewal-hooks/post /dev/null << EOF
#!/bin/bash
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /app/certs/server.crt
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /app/certs/server.key
docker restart expense-tracker-app
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/post

# Add to crontab for automatic renewal
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet") | crontab -
```

### For AWS (Using AWS Certificate Manager)

#### CLI Method:
```bash
#!/bin/bash

DOMAIN="yourdomain.com"

# Request certificate from ACM
aws acm request-certificate \
  --domain-name "$DOMAIN" \
  --subject-alternative-names "www.$DOMAIN" \
  --validation-method DNS \
  --region us-east-1

echo "✅ Certificate requested in ACM"
echo "⚠️  Complete DNS validation to activate certificate"
```

## Certificate Information Commands

```bash
# View certificate details
openssl x509 -in certs/server.crt -text -noout

# Check certificate expiration
openssl x509 -in certs/server.crt -noout -enddate

# Verify private key and certificate match
openssl x509 -noout -modulus -in certs/server.crt | openssl md5
openssl rsa -noout -modulus -in certs/server.key | openssl md5

# Check certificate chain
openssl verify -CAfile certs/ca-bundle.crt certs/server.crt

# Convert certificate format (PEM to DER)
openssl x509 -in certs/server.crt -outform DER -out certs/server.der

# Convert certificate format (PEM to PKCS12)
openssl pkcs12 -export \
  -in certs/server.crt \
  -inkey certs/server.key \
  -out certs/server.p12 \
  -name "expense-tracker"
```

## Test HTTPS Connection

```bash
# Test basic connectivity
curl -k https://localhost:443

# Test with certificate verification
curl --cacert certs/server.crt https://localhost:443

# Test with OpenSSL
openssl s_client -connect localhost:443

# Check certificate details from live server
openssl s_client -connect yourdomain.com:443 -showcerts

# Performance test with Apache Bench
ab -n 100 -c 10 https://localhost:443/

# Full SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/?d=yourdomain.com
```

## Docker Certificate Management

```bash
# Build Docker image with certificates
docker build -t expense-tracker:latest .

# Run container with mounted certificates
docker run -v $(pwd)/certs:/app/certs:ro \
  -e SSL_CERT_PATH=/app/certs/server.crt \
  -e SSL_KEY_PATH=/app/certs/server.key \
  -p 80:80 -p 443:443 \
  expense-tracker:latest

# Using docker-compose
docker-compose up -d

# Renew certificates (volume mounted)
# Restart container: docker-compose restart app
```

## AWS Deployment with ACM

```bash
#!/bin/bash

# Set variables
CERT_ARN="arn:aws:acm:region:account-id:certificate/cert-id"
LOAD_BALANCER_ARN="arn:aws:elasticloadbalancing:region:account-id:loadbalancer/app/name/id"

# Update load balancer listener with certificate
aws elbv2 modify-listener \
  --listener-arn "$LISTENER_ARN" \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn="$CERT_ARN"

# Verify certificate
aws acm describe-certificate --certificate-arn "$CERT_ARN"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Certificate expired | Renew with Let's Encrypt or generate new self-signed |
| Port 443 permission denied | Use sudo or port > 1024 (8443) |
| Mixed content warning | Ensure all resources use HTTPS |
| Certificate not found in Docker | Check volume mount path and file permissions |
| Wildcard certificate needed | Use `*.yourdomain.com` when generating |

## File Permissions

```bash
# Secure certificate files (Linux)
chmod 600 certs/server.key
chmod 644 certs/server.crt
chown root:root certs/

# For Docker containers
chmod 644 certs/server.key
chmod 644 certs/server.crt
```

## Monitoring Certificate Expiration

```bash
#!/bin/bash

CERT_FILE="certs/server.crt"
WARN_DAYS=30

expiry_date=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
expiry_seconds=$(date -d "$expiry_date" +%s)
now_seconds=$(date +%s)
days_left=$(( ($expiry_seconds - $now_seconds) / 86400 ))

if [ $days_left -lt 0 ]; then
    echo "❌ CERTIFICATE EXPIRED!"
elif [ $days_left -lt $WARN_DAYS ]; then
    echo "⚠️  WARNING: Certificate expires in $days_left days"
else
    echo "✅ Certificate valid for $days_left days"
fi
```

Add to crontab to monitor daily:
```bash
0 9 * * * /path/to/check_cert.sh | mail -s "Certificate Status" admin@example.com
```
