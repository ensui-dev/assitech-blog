# AssiTech AWS CDK Infrastructure

Infrastructure as Code for deploying the AssiTech blog application to AWS using AWS CDK.

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              VPC (Multi-AZ, Public Subnets)                │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              Public Subnet (AZ1/AZ2)                 │  │   │
│  │  │                                                      │  │   │
│  │  │  ┌──────────────────┐    ┌──────────────────────┐    │  │   │
│  │  │  │   EC2 Instance   │───→│   RDS PostgreSQL     │    │  │   │
│  │  │  │   • Frontend     │    │   (Security Group    │    │  │   │
│  │  │  │   • Backend      │    │    Protected)        │    │  │   │
│  │  │  └────────┬─────────┘    └──────────────────────┘    │  │   │
│  │  │           │                                          │  │   │
│  │  └───────────┼──────────────────────────────────────────┘  │   │
│  └──────────────┼─────────────────────────────────────────────┘   │
│                 │                                                 │
│   ┌─────────────┴────────────────────────────────────────────┐    │
│   │                  AWS Services                            │    │
│   │                                                          │    │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │    │
│   │  │    ECR     │  │  Secrets   │  │    CloudWatch      │  │    │
│   │  │            │  │  Manager   │  │                    │  │    │
│   │  │ • backend  │  │ • DB creds │  │ • /assitech/docker │  │    │
│   │  │ • frontend │  │ • API keys │  │ • CodeBuild logs   │  │    │
│   │  └────────────┘  └────────────┘  └────────────────────┘  │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │                   CI/CD Pipeline                         │    │
│   │                                                          │    │
│   │  ┌────────────┐         ┌────────────┐        ┌───────┐  │    │
│   │  │   GitHub   │ Webhook │ CodeBuild  │ Push   │  ECR  │  │    │
│   │  │            │────────→│            │───────→│       │  │    │
│   │  │  (Source)  │         │  (Docker)  │        │       │  │    │
│   │  └────────────┘         └────────────┘        └───────┘  │    │
│   └──────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
infra/
├── bin/
│   └── app.ts                    # CDK app entry point
├── lib/
│   ├── network-stack.ts          # VPC, subnets, security groups
│   ├── ecr-stack.ts              # ECR repositories
│   ├── codebuild-stack.ts        # CI/CD build project
│   ├── database-stack.ts         # RDS PostgreSQL
│   └── compute-stack.ts          # EC2 instance
├── scripts/
│   ├── build-and-push.sh         # Build & push Docker images
│   ├── deploy.sh                 # Deployment helper
│   ├── user-data.sh              # EC2 initialization script
│   └── init-ec2.sh               # EC2 setup utilities
├── .env.example                  # Environment template
├── buildspec.yml                 # CodeBuild specification
├── cdk.json                      # CDK configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Stacks

### 1. Network Stack
- VPC with public subnets across 2 AZs (no NAT Gateway for free tier)
- Security Groups for application and database
- Database secured via security group rules (EC2-only access)

### 2. ECR Stack
- Container registries for backend and frontend images
- Image scanning enabled
- Lifecycle policies to keep last 10 images

### 3. CodeBuild Stack
- Automated CI/CD pipeline for building Docker images
- GitHub integration with webhook triggers
- Builds and pushes to ECR on code push
- Docker layer caching for faster builds

### 4. Database Stack
- RDS PostgreSQL 16 instance (db.t3.micro for free tier)
- Automated backups (7-day retention)
- Performance Insights disabled (free tier optimization)
- Stored in public subnet, secured via security groups

### 5. Compute Stack
- EC2 instance (t2.micro for free tier)
- Amazon Linux 2023 AMI
- Auto-configured with Docker and Docker Compose
- Pulls images from ECR on startup
- Initializes database automatically
- CloudWatch Agent for log shipping
- IAM role for ECR, Secrets Manager, CloudWatch access

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- Docker installed locally
- AWS account with appropriate permissions

## Quick Start

### 1. Install Dependencies

```bash
cd infra
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Required variables:
```bash
# AWS Configuration
AWS_ACCOUNT_ID=123456789012
AWS_REGION=eu-west-3  # Paris region

# EC2 Configuration
EC2_INSTANCE_TYPE=t2.micro  # Free tier eligible
EC2_KEY_PAIR_NAME=your-keypair-name

# Database
DB_USERNAME=bloguser
DB_PASSWORD=SecurePassword123!
DB_NAME=blogdb

# API Keys
HUGGINGFACE_API_KEY=hf_your_key
UNSPLASH_ACCESS_KEY=your_unsplash_key  # Optional - for article images

# Authentication
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_EMAIL=admin@assitech.challenge
ADMIN_PASSWORD=AdminPassword123!

# CodeBuild CI/CD (Required for automated builds)
GITHUB_REPO=your-username/your-repo-name
GITHUB_BRANCH=main
GITHUB_TOKEN=ghp_your_github_personal_access_token
```

### 3. Bootstrap CDK (First Time Only)

```bash
npx cdk bootstrap aws://ACCOUNT_ID/REGION
```

### 4. Configure GitHub Integration

Set up automated CI/CD with CodeBuild:

1. **Create GitHub Personal Access Token**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Select scopes: `repo` (full control of private repositories)
   - Copy the token (starts with `ghp_`)

2. **Add to `.env`**:
   ```bash
   GITHUB_REPO=your-username/assitech
   GITHUB_BRANCH=main
   GITHUB_TOKEN=ghp_your_token_here
   ```

### 5. Deploy Infrastructure

Deploy all AWS resources:

```bash
npm run deploy
```

This deploys all 5 stacks in order and outputs the application URL.

### 6. Build Docker Images

Trigger CodeBuild to build and push your Docker images:

```bash
aws codebuild start-build --project-name assitech-blog-build
```

## How CodeBuild Works

When you push code to GitHub (main branch):

1. **GitHub webhook** triggers CodeBuild
2. **CodeBuild** pulls your repository
3. **Builds Docker images** for backend and frontend
4. **Tags images** with commit hash and `latest`
5. **Pushes to ECR** automatically

### View Build Status

Monitor builds in AWS Console:
- CodeBuild → Build projects → assitech-blog-build → Build history

Or via CLI:
```bash
aws codebuild list-builds-for-project \
  --project-name assitech-blog-build \
  --max-items 5
```

## Deployment Workflow

Complete automated workflow:

```
Git Push → GitHub → CodeBuild Webhook → Build Images → Push to ECR → SSH to EC2 → Update Containers
```

1. Push code changes to GitHub
2. CodeBuild automatically builds new images
3. SSH to EC2 and run `/opt/assitech/update.sh`
4. Script pulls latest images and restarts containers

## Deployment Steps (Detailed)

### Step 1: Prepare Environment

1. Create an EC2 key pair in AWS Console:
   - EC2 → Key Pairs → Create Key Pair
   - Save the `.pem` file securely

2. Get your AWS Account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

3. Configure `.env` file with all required values

### Step 2: Bootstrap CDK

Run this once per account/region combination:

```bash
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/YOUR_REGION
```

### Step 3: Build Docker Images

The application needs Docker images in ECR before deployment:

```bash
cd infra
./scripts/build-and-push.sh
```

This script:
- Authenticates to ECR
- Builds backend and frontend images
- Pushes them to ECR (repositories created by CDK)

### Step 4: Deploy All Stacks

```bash
npm run deploy
```

Or deploy stacks individually (in dependency order):
```bash
npx cdk deploy assitech-network-prod
npx cdk deploy assitech-ecr-prod
npx cdk deploy assitech-codebuild-prod
npx cdk deploy assitech-database-prod
npx cdk deploy assitech-compute-prod
```

### Step 5: Access Your Application

After deployment completes, CDK outputs will show:
- **Application URL**: http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com
- **Admin URL**: http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com/login

## CDK Commands

```bash
# Show deployment plan
npm run diff

# Synthesize CloudFormation templates
npm run synth

# Deploy all stacks
npm run deploy

# Destroy all stacks
npm run destroy

# List all stacks
npx cdk list
```

## Updating the Application

### Update Application Code

When you make code changes:

```bash
# 1. Push code changes to GitHub
git add .
git commit -m "Update application"
git push origin main

# 2. CodeBuild automatically builds new images and pushes to ECR
# Monitor: AWS Console → CodeBuild → assitech-blog-build

# 3. SSH into EC2 and pull new images
ssh -i your-key.pem ec2-user@your-instance-ip
/opt/assitech/update.sh
```

The update script pulls latest images from ECR and restarts containers.

### Update Infrastructure

If you modify CDK code:
```bash
npm run deploy
```

## Monitoring and Logs

### View Container Logs

```bash
ssh -i your-key.pem ec2-user@your-instance-ip

# Backend logs
docker logs -f assitech-backend

# Frontend logs
docker logs -f assitech-frontend

# All logs
docker-compose -f /opt/assitech/docker-compose.yml logs -f
```

### CloudWatch Logs

Docker logs are automatically shipped to CloudWatch Logs:
- Log Group: `/assitech/docker`
- Log Stream: `{instance-id}`

### Check Container Status

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
docker ps
docker stats
```

## Database Management

### Connect to Database

```bash
# Get DB credentials from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id assitech/database/credentials \
  --query SecretString \
  --output text | jq .

# Connect via EC2 instance (bastion)
ssh -i your-key.pem ec2-user@your-instance-ip

# Install PostgreSQL client
sudo yum install -y postgresql15

# Connect to RDS
psql -h YOUR_RDS_ENDPOINT -U bloguser -d blogdb
```

### Backup Database

Automated backups are enabled by default (7-day retention).

Manual backup:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier assitech-database-xxx \
  --db-snapshot-identifier assitech-backup-$(date +%Y%m%d)
```

### Restore Database

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier assitech-database-restored \
  --db-snapshot-identifier assitech-backup-20240101
```

## Security

### Secrets Management

All sensitive data is stored in AWS Secrets Manager:
- Database credentials (auto-generated)
- Application secrets (JWT, API keys, admin password)

Secrets are injected into the EC2 instance at launch time.

### Network Security

- Database in public subnet but secured via security groups (no public access)
- Application in public subnet (internet-facing)
- Security groups restrict traffic:
  - App: Ports 22, 80, 443, 3000
  - DB: Port 5432 only from app security group (EC2-only access)

### IAM Permissions

EC2 instance has minimal required permissions:
- ECR pull access
- Secrets Manager read access
- CloudWatch Logs write access
- SSM for session management


## Troubleshooting

### Stack Deployment Failed

```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name assitech-compute-prod \
  --max-items 20

# View CDK diff
npm run diff
```

### Application Not Starting

```bash
# SSH to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Check user data logs
sudo cat /var/log/cloud-init-output.log

# Check Docker containers
docker ps -a
docker logs assitech-backend
```

### Database Connection Issues

```bash
# Verify security group rules
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*Database*"

# Test connectivity from EC2
telnet YOUR_RDS_ENDPOINT 5432
```

### ECR Authentication Issues

```bash
# Re-authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

## Cleanup

### Destroy All Resources

```bash
npm run destroy
```

This will delete all stacks in reverse dependency order.

**Note**: ECR repositories are retained by default for safety.
RDS database has `removalPolicy: DESTROY` set for easier cleanup during development.
To retain RDS in production, change to `removalPolicy: RETAIN` in `database-stack.ts`.

### Manual Cleanup

```bash
# Delete ECR images
aws ecr batch-delete-image \
  --repository-name assitech-backend \
  --image-ids imageTag=latest

# Delete RDS snapshots
aws rds delete-db-snapshot --db-snapshot-identifier snapshot-name

# Empty and delete ECR repositories
aws ecr delete-repository --repository-name assitech-backend --force
```

## Advanced Configuration

### Custom Domain

1. Update `.env`:
```bash
DOMAIN_NAME=blog.yourdomain.com
CERTIFICATE_ARN=arn:aws:acm:us-east-1:xxx:certificate/xxx
```

2. Modify `compute-stack.ts` to add ALB with SSL

### Auto Scaling

Enable auto scaling in `.env`:
```bash
ENABLE_AUTO_SCALING=true
```

Then modify `compute-stack.ts` to use Auto Scaling Group instead of single EC2.

### Multi-Region

Deploy to multiple regions:
```bash
AWS_REGION=us-east-1 npm run deploy
AWS_REGION=eu-west-1 npm run deploy
```

## Support

For issues or questions:
- Check AWS CloudFormation console for stack status
- Review CloudWatch Logs for application logs
- Check `/var/log/cloud-init-output.log` on EC2 for startup issues