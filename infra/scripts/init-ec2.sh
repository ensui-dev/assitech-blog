#!/bin/bash

# EC2 Instance Initialization Script
# Run this script on a fresh EC2 instance to set up the environment

set -e

echo "========================================="
echo "AssiTech Blog - EC2 Initialization"
echo "========================================="

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI (usually pre-installed on Amazon Linux 2)
echo "Verifying AWS CLI..."
aws --version || {
    echo "Installing AWS CLI..."
    sudo yum install -y aws-cli
}

# Install Git
echo "Installing Git..."
sudo yum install -y git

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/assitech-blog
sudo chown ec2-user:ec2-user /opt/assitech-blog

# Configure AWS ECR login
echo "Configuring ECR login..."
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create environment file template
cat > /opt/assitech-blog/.env << EOF
HUGGINGFACE_API_KEY=your_key_here
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpassword
POSTGRES_DB=blogdb
AWS_REGION=${AWS_REGION}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
EOF

echo ""
echo "========================================="
echo "Initialization Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit /opt/assitech-blog/.env with your HuggingFace API key"
echo "2. Run the deployment script: ./deploy.sh"
echo ""
echo "Important: Log out and log back in for Docker group changes to take effect"
echo "Or run: newgrp docker"
