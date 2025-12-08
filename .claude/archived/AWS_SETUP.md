# AWS Deployment Setup Guide

Complete guide for deploying AssiTech Blog to AWS.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Basic understanding of AWS services
- GitHub repository with your code

## Cost Estimate

- **EC2 t2.micro**: $0/month (free tier: 750 hours)
- **ECR**: ~$0.10/month (minimal storage)
- **CodeBuild**: $0/month (100 build minutes free)
- **Data Transfer**: Minimal
- **Total**: ~$0-5/month

## Step-by-Step Setup

### 1. Create ECR Repositories

```bash
# Set your AWS region
export AWS_REGION=us-east-1

# Create backend repository
aws ecr create-repository \
    --repository-name assitech-blog-backend \
    --region $AWS_REGION

# Create frontend repository
aws ecr create-repository \
    --repository-name assitech-blog-frontend \
    --region $AWS_REGION

# Save the repository URIs (you'll need these)
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export BACKEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/assitech-blog-backend"
export FRONTEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/assitech-blog-frontend"

echo "Backend Repo: $BACKEND_REPO"
echo "Frontend Repo: $FRONTEND_REPO"
```

### 2. Create IAM Role for CodeBuild

Create a file `codebuild-trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "codebuild.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
}
```

Create the role:
```bash
aws iam create-role \
    --role-name AssiTechCodeBuildRole \
    --assume-role-policy-document file://codebuild-trust-policy.json

# Attach necessary policies
aws iam attach-role-policy \
    --role-name AssiTechCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
    --role-name AssiTechCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```

### 3. Create CodeBuild Project

Create `codebuild-project.json`:
```json
{
  "name": "AssiTechBlogBuild",
  "source": {
    "type": "GITHUB",
    "location": "https://github.com/YOUR_USERNAME/YOUR_REPO.git",
    "gitCloneDepth": 1,
    "buildspec": "infra/buildspec.yml"
  },
  "artifacts": {
    "type": "NO_ARTIFACTS"
  },
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": true,
    "environmentVariables": [
      {
        "name": "AWS_ACCOUNT_ID",
        "value": "YOUR_ACCOUNT_ID",
        "type": "PLAINTEXT"
      },
      {
        "name": "AWS_REGION",
        "value": "us-east-1",
        "type": "PLAINTEXT"
      }
    ]
  },
  "serviceRole": "arn:aws:iam::YOUR_ACCOUNT_ID:role/AssiTechCodeBuildRole"
}
```

Create the project:
```bash
# Update the JSON with your values first
aws codebuild create-project --cli-input-json file://codebuild-project.json
```

### 4. Launch EC2 Instance

**Via AWS Console**:

1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Choose:
   - **AMI**: Amazon Linux 2023
   - **Instance Type**: t2.micro (free tier)
   - **Key Pair**: Create or select existing
   - **Security Group**: Create new with:
     - SSH (22) from your IP
     - HTTP (80) from anywhere (0.0.0.0/0)
     - Custom TCP (3000) from anywhere (optional)
4. Launch instance

**Via AWS CLI**:

```bash
# Create security group
aws ec2 create-security-group \
    --group-name assitech-blog-sg \
    --description "Security group for AssiTech Blog"

export SG_ID=$(aws ec2 describe-security-groups \
    --group-names assitech-blog-sg \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# Add inbound rules
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Launch instance
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t2.micro \
    --key-name YOUR_KEY_PAIR \
    --security-group-ids $SG_ID \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=AssiTech-Blog}]'
```

### 5. Configure EC2 Instance

SSH into your instance:
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

Download and run the initialization script:
```bash
# Download init script
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/infra/scripts/init-ec2.sh

# Make executable
chmod +x init-ec2.sh

# Run (as root for package installation)
sudo ./init-ec2.sh

# Log out and back in for group changes to take effect
exit
```

### 6. Configure Environment on EC2

```bash
# SSH back in
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Edit environment file
sudo nano /opt/assitech-blog/.env
```

Add your configuration:
```env
HUGGINGFACE_API_KEY=hf_your_actual_key_here
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=CHANGE_THIS_TO_SECURE_PASSWORD
POSTGRES_DB=blogdb
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your_account_id
```

Save and exit (Ctrl+X, Y, Enter)

### 7. Initial Build and Push to ECR

On your local machine:

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build backend
cd backend
docker build -t $BACKEND_REPO:latest .
docker push $BACKEND_REPO:latest
cd ..

# Build frontend
cd frontend
docker build -t $FRONTEND_REPO:latest .
docker push $FRONTEND_REPO:latest
cd ..
```

### 8. Deploy Application

Back on EC2:

```bash
# Clone your repository or download deploy script
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /opt/assitech-blog

# Or download just the deploy script
cd /opt/assitech-blog
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/infra/scripts/deploy.sh
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 9. Verify Deployment

```bash
# Check container status
docker ps

# Should see 3 containers running:
# - assitech-postgres
# - assitech-backend
# - assitech-frontend

# Check application
curl http://localhost/health

# Get public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

Open browser to: `http://YOUR_EC2_PUBLIC_IP`

## Post-Deployment

### Set Up GitHub Webhook (Optional)

1. Go to GitHub repository settings
2. Webhooks → Add webhook
3. Payload URL: Your CodeBuild webhook URL
4. Content type: application/json
5. Events: Push events
6. Save

Now every push triggers a build!

### Set Up CloudWatch Monitoring

```bash
# Install CloudWatch agent on EC2
sudo yum install amazon-cloudwatch-agent -y

# Configure (optional)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### Configure Auto-Deployment (Optional)

Add to EC2 crontab for automatic updates:

```bash
# On EC2, add to crontab
crontab -e

# Add this line to check for updates every hour:
0 * * * * cd /opt/assitech-blog && ./deploy.sh >> /var/log/assitech-deploy.log 2>&1
```

## Maintenance

### Update Application

```bash
# On EC2
cd /opt/assitech-blog
./deploy.sh
```

### View Logs

```bash
# Backend logs
docker logs -f assitech-backend

# Frontend logs
docker logs -f assitech-frontend

# Database logs
docker logs -f assitech-postgres
```

### Backup Database

```bash
# Create backup
docker exec assitech-postgres pg_dump -U bloguser blogdb > backup.sql

# Upload to S3 (optional)
aws s3 cp backup.sql s3://your-backup-bucket/backups/$(date +%Y%m%d).sql
```

### Restore Database

```bash
# From backup file
docker exec -i assitech-postgres psql -U bloguser blogdb < backup.sql
```

## Troubleshooting

### Can't Access Application

1. Check security group allows port 80
2. Check containers are running: `docker ps`
3. Check backend health: `curl http://localhost:3000/health`
4. Check logs: `docker logs assitech-backend`

### CodeBuild Fails

1. Check IAM role has ECR permissions
2. Verify buildspec.yml path is correct
3. Check CloudWatch logs for details
4. Ensure Docker is in privileged mode

### Database Connection Issues

1. Check PostgreSQL is running: `docker ps | grep postgres`
2. Check environment variables: `docker exec assitech-backend env | grep POSTGRES`
3. Check logs: `docker logs assitech-postgres`

## Security Best Practices

### 1. Use HTTPS

```bash
# Install Certbot
sudo yum install certbot -y

# Get certificate (requires domain name)
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration to use SSL
```

### 2. Secure PostgreSQL Password

```bash
# Change from default password
# Edit .env file with strong password
sudo nano /opt/assitech-blog/.env

# Redeploy
./deploy.sh
```

### 3. Restrict Security Group

```bash
# SSH only from your IP
aws ec2 revoke-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32
```

### 4. Regular Updates

```bash
# Update EC2 packages
sudo yum update -y

# Update Docker images
cd /opt/assitech-blog
./deploy.sh
```

## Cost Optimization

1. **Use Free Tier**
   - t2.micro for EC2
   - 100 CodeBuild minutes/month
   - ECR free tier (1 GB)

2. **Stop EC2 When Not Needed**
   ```bash
   # Stop instance (saves money)
   aws ec2 stop-instances --instance-ids i-xxxxx

   # Start when needed
   aws ec2 start-instances --instance-ids i-xxxxx
   ```

3. **Monitor Costs**
   - Set up billing alerts
   - Check AWS Cost Explorer
   - Monitor free tier usage

## Next Steps

1. ✅ Point a domain name to your EC2 IP
2. ✅ Set up SSL with Let's Encrypt
3. ✅ Configure CloudWatch alarms
4. ✅ Set up automated backups to S3
5. ✅ Implement auto-scaling (if needed)

## Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues or questions:
- Check logs: `docker logs assitech-backend`
- Review [README.md](README.md)
- Check [ARCHITECTURE.md](docs/ARCHITECTURE.md)
