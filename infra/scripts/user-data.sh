#!/bin/bash
set -ex

# AssiTech EC2 User Data Script
# This script runs on instance launch to setup Docker and deploy the application

echo "====================================="
echo "AssiTech Instance Setup Starting"
echo "====================================="

# Update system
echo "[1/8] Updating system packages..."
yum update -y

# Install Docker
echo "[2/8] Installing Docker..."
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
echo "[3/8] Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI v2
echo "[4/8] Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Install jq for JSON parsing
echo "[5/8] Installing jq..."
yum install -y jq

# Get secrets from AWS Secrets Manager
echo "[6/8] Fetching secrets from Secrets Manager..."
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id {{DB_SECRET_ARN}} \
  --region {{AWS_REGION}} \
  --query SecretString \
  --output text)

APP_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id {{APP_SECRET_ARN}} \
  --region {{AWS_REGION}} \
  --query SecretString \
  --output text)

# Extract credentials (quote properly to prevent glob expansion)
DB_USERNAME=$(echo "$DB_SECRET" | jq -r .username)
DB_PASSWORD=$(echo "$DB_SECRET" | jq -r .password)
HUGGINGFACE_API_KEY=$(echo "$APP_SECRET" | jq -r .HUGGINGFACE_API_KEY)
HUGGINGFACE_MODEL=$(echo "$APP_SECRET" | jq -r .HUGGINGFACE_MODEL)
UNSPLASH_ACCESS_KEY=$(echo "$APP_SECRET" | jq -r .UNSPLASH_ACCESS_KEY)
JWT_SECRET=$(echo "$APP_SECRET" | jq -r .JWT_SECRET)
ADMIN_EMAIL=$(echo "$APP_SECRET" | jq -r .ADMIN_EMAIL)
ADMIN_PASSWORD=$(echo "$APP_SECRET" | jq -r .ADMIN_PASSWORD)
ARTICLE_GENERATION_CRON=$(echo "$APP_SECRET" | jq -r .ARTICLE_GENERATION_CRON)

# Create application directory
mkdir -p /opt/assitech
cd /opt/assitech

# Create docker-compose.yml
echo "[7/8] Creating Docker Compose configuration..."
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  backend:
    image: {{BACKEND_REPO}}:latest
    container_name: assitech-backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      POSTGRES_HOST: {{DB_HOST}}
      POSTGRES_PORT: {{DB_PORT}}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: {{DB_NAME}}
      HUGGINGFACE_API_KEY: ${HUGGINGFACE_API_KEY}
      HUGGINGFACE_MODEL: ${HUGGINGFACE_MODEL}
      UNSPLASH_ACCESS_KEY: ${UNSPLASH_ACCESS_KEY}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      ARTICLE_GENERATION_CRON: ${ARTICLE_GENERATION_CRON}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: {{FRONTEND_REPO}}:latest
    container_name: assitech-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Create .env file (quote values that may contain special characters)
cat > .env <<EOF
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY}
HUGGINGFACE_MODEL=${HUGGINGFACE_MODEL}
UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY}
JWT_SECRET=${JWT_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ARTICLE_GENERATION_CRON="${ARTICLE_GENERATION_CRON}"
EOF

# Authenticate Docker to ECR
echo "[8/8] Authenticating to ECR and deploying application..."
aws ecr get-login-password --region {{AWS_REGION}} | \
  docker login --username AWS --password-stdin {{AWS_ACCOUNT_ID}}.dkr.ecr.{{AWS_REGION}}.amazonaws.com

# Pull images
docker-compose pull

# Start application
docker-compose up -d

# Wait for backend to be healthy
echo "Waiting for backend to be healthy..."
sleep 30

# Initialize database (only runs if no articles exist)
docker exec assitech-backend npm run init-db || true

# Create update script
cat > /opt/assitech/update.sh <<'UPDATEEOF'
#!/bin/bash
set -e

echo "Updating AssiTech application..."

cd /opt/assitech

# Authenticate to ECR
aws ecr get-login-password --region {{AWS_REGION}} | \
  docker login --username AWS --password-stdin {{AWS_ACCOUNT_ID}}.dkr.ecr.{{AWS_REGION}}.amazonaws.com

# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d

echo "Update complete!"
UPDATEEOF

chmod +x /opt/assitech/update.sh

# Setup CloudWatch logs
echo "Setting up CloudWatch logs..."
yum install -y amazon-cloudwatch-agent

cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<'CWEOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/lib/docker/containers/*/*.log",
            "log_group_name": "/assitech/docker",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
CWEOF

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

echo "====================================="
echo "AssiTech Instance Setup Complete!"
echo "====================================="
echo ""
echo "Services running:"
docker ps
echo ""
echo "Application URL: http://$(ec2-metadata --public-hostname | cut -d' ' -f2)"
echo "Admin Login: http://$(ec2-metadata --public-hostname | cut -d' ' -f2)/login"
echo ""
echo "To update the application, run: /opt/assitech/update.sh"
echo "To view logs: docker logs -f assitech-backend"
echo "====================================="
