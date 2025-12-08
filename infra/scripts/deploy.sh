#!/bin/bash

# Deployment script for EC2
# Pulls latest images from ECR and restarts containers

set -e

echo "========================================="
echo "AssiTech Blog - Deployment Script"
echo "========================================="

# Load environment variables
if [ -f /opt/assitech-blog/.env ]; then
    source /opt/assitech-blog/.env
else
    echo "Error: .env file not found in /opt/assitech-blog/"
    exit 1
fi

# Set variables
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
BACKEND_IMAGE="${ECR_URI}/assitech-blog-backend:latest"
FRONTEND_IMAGE="${ECR_URI}/assitech-blog-frontend:latest"

# Login to ECR
echo "Logging in to AWS ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

# Pull latest images
echo "Pulling latest Docker images..."
docker pull ${BACKEND_IMAGE}
docker pull ${FRONTEND_IMAGE}

# Stop and remove old containers
echo "Stopping existing containers..."
docker stop assitech-postgres assitech-backend assitech-frontend 2>/dev/null || true
docker rm assitech-postgres assitech-backend assitech-frontend 2>/dev/null || true

# Create Docker network if it doesn't exist
docker network create assitech-network 2>/dev/null || true

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker run -d \
  --name assitech-postgres \
  --network assitech-network \
  -e POSTGRES_USER=${POSTGRES_USER} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${POSTGRES_DB} \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Start Backend
echo "Starting Backend..."
docker run -d \
  --name assitech-backend \
  --network assitech-network \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e POSTGRES_HOST=assitech-postgres \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=${POSTGRES_USER} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${POSTGRES_DB} \
  -e HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY} \
  -e HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1 \
  -e ARTICLE_GENERATION_CRON="0 2 * * *" \
  --restart unless-stopped \
  ${BACKEND_IMAGE}

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 5

# Initialize database (create tables and seed data)
echo "Initializing database..."
docker exec assitech-backend npm run init-db || echo "Database already initialized"

# Start Frontend
echo "Starting Frontend..."
docker run -d \
  --name assitech-frontend \
  --network assitech-network \
  -p 80:80 \
  --restart unless-stopped \
  ${FRONTEND_IMAGE}

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Services Status:"
docker ps --filter "name=assitech-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Application should be accessible at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "Useful commands:"
echo "  View logs: docker logs -f assitech-backend"
echo "  Check status: docker ps"
echo "  Restart: docker restart assitech-backend assitech-frontend"
