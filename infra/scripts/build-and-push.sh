#!/bin/bash
set -e

# Build and Push Docker Images to ECR
# This script builds the frontend and backend Docker images and pushes them to ECR

echo "======================================"
echo "AssiTech - Build and Push Images"
echo "======================================"

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

source .env

# Validate required variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "Error: AWS_ACCOUNT_ID and AWS_REGION must be set in .env"
    exit 1
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo ""
echo "Configuration:"
echo "  AWS Account: $AWS_ACCOUNT_ID"
echo "  AWS Region: $AWS_REGION"
echo "  ECR Registry: $ECR_REGISTRY"
echo ""

# Authenticate Docker to ECR
echo "[1/3] Authenticating Docker to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY
echo "✓ Authenticated"

# Build and push backend
echo ""
echo "[2/3] Building and pushing backend image..."
cd ../backend
docker build -t assitech-backend:latest .
docker tag assitech-backend:latest ${ECR_REGISTRY}/assitech-backend:latest
docker push ${ECR_REGISTRY}/assitech-backend:latest
echo "✓ Backend image pushed"

# Build and push frontend
echo ""
echo "[3/3] Building and pushing frontend image..."
cd ../frontend
docker build -t assitech-frontend:latest .
docker tag assitech-frontend:latest ${ECR_REGISTRY}/assitech-frontend:latest
docker push ${ECR_REGISTRY}/assitech-frontend:latest
echo "✓ Frontend image pushed"

echo ""
echo "======================================"
echo "Images successfully pushed to ECR!"
echo "======================================"
echo ""
echo "Backend: ${ECR_REGISTRY}/assitech-backend:latest"
echo "Frontend: ${ECR_REGISTRY}/assitech-frontend:latest"
echo ""
echo "Next step: Deploy infrastructure with CDK"
echo "  cd ../infra"
echo "  npm run deploy"
echo ""
