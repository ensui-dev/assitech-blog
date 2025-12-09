# AssiTech - AWS CDK Deployment Guide

Complete guide for deploying AssiTech to AWS using infrastructure as code with AWS CDK.

## Overview

This deployment uses AWS CDK (Cloud Development Kit) to provision and manage all AWS infrastructure:
- **VPC**: Network isolation with public subnets
- **RDS**: PostgreSQL database with automated backups (secured via security groups)
- **ECR**: Docker container registry
- **CodeBuild**: CI/CD pipeline for automated Docker builds
- **EC2**: Application server with auto-configuration
- **Secrets Manager**: Secure credential storage
- **CloudWatch**: Application monitoring and logs

## Prerequisites

- AWS Account (free tier eligible recommended)
- AWS CLI installed and configured
- Node.js 18+ and npm
- GitHub account and repository
- Basic familiarity with terminal/command line

## Quick Start (6 Steps)

### 1. Setup Project

```bash
cd infra
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with your values
```

Required configuration:
```bash
AWS_ACCOUNT_ID=123456789012  # Get with: aws sts get-caller-identity
AWS_REGION=eu-west-3  # Paris region
EC2_KEY_PAIR_NAME=your-keypair  # Create in EC2 console first
EC2_INSTANCE_TYPE=t2.micro  # Free tier eligible (750 hours/month)
DB_PASSWORD=SecurePass123!
HUGGINGFACE_API_KEY=hf_your_key
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=AdminPass123!
GITHUB_REPO=your-username/assitech
GITHUB_BRANCH=main
GITHUB_TOKEN=ghp_your_github_personal_access_token
```

### 3. Bootstrap CDK (First Time Only)

```bash
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/YOUR_REGION
```

### 4. Configure GitHub Integration

Set up GitHub for automated CI/CD with CodeBuild:

1. **Create GitHub Personal Access Token**

2. **Add to `.env`**:
   ```bash
   GITHUB_REPO=your-username/assitech
   GITHUB_BRANCH=main
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   ```

### 5. Deploy Infrastructure (Two-Phase Deployment)

**IMPORTANT**: Deploy in two phases to ensure Docker images exist before EC2 starts.

#### Phase 1: Deploy infrastructure WITHOUT compute stack

```bash
npx cdk deploy assitech-network-prod assitech-ecr-prod assitech-database-prod assitech-codebuild-prod --require-approval never
```

This creates:
- Network (VPC, subnets, security groups)
- ECR (container registries)
- Database (RDS PostgreSQL)
- CodeBuild (CI/CD pipeline)

### 6. Build and Push Docker Images

Trigger CodeBuild to build your Docker images:

```bash
aws codebuild start-build --project-name assitech-blog-build --region eu-west-3
```

Wait for the build to complete:
```bash
# Check build status (wait for SUCCEEDED)
aws codebuild list-builds-for-project --project-name assitech-blog-build --region eu-west-3 --query 'ids[0]' --output text | xargs -I {} aws codebuild batch-get-builds --ids {} --region eu-west-3 --query 'builds[0].buildStatus' --output text
```

Monitor in AWS Console: CodeBuild → Build projects → assitech-blog-build → Build history

#### Phase 2: Deploy compute stack AFTER images are ready

```bash
npx cdk deploy assitech-compute-prod --require-approval never
```

This ensures the EC2 instance can pull Docker images from ECR when it starts.

> **Why two phases?** The EC2 user-data script runs on first boot and tries to pull Docker images from ECR. If images don't exist yet, the script fails and containers won't start. By building images first, the EC2 instance can successfully pull and run them on startup.

## Detailed Setup

### Step 1: Create EC2 Key Pair

1. Go to AWS Console → EC2 → Key Pairs
2. Click "Create key pair"
3. Name: `assitech-keypair`
4. Type: RSA
5. Format: .pem
6. Click "Create key pair"
7. Save the `.pem` file securely

### Step 2: Get AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

### Step 3: Configure Environment Variables

Edit `infra/.env`:

```bash
# AWS Configuration
AWS_ACCOUNT_ID=123456789012  # From step 2
AWS_REGION=us-east-1
EC2_KEY_PAIR_NAME=assitech-keypair  # From step 1

# Database
DB_USERNAME=bloguser
DB_PASSWORD=YourSecurePassword123!
DB_NAME=blogdb

# HuggingFace API (get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=hf_your_key_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct

# Unsplash API (optional, get from https://unsplash.com/developers)
UNSPLASH_ACCESS_KEY=your_key

# JWT Secret (generate)
JWT_SECRET=$(openssl rand -base64 32)

# Admin Credentials
ADMIN_EMAIL=admin@assitech.challenge
ADMIN_PASSWORD=YourAdminPassword123!
```

### Step 4: Deploy (Two-Phase Process)

**IMPORTANT**: Deploy in two phases to ensure Docker images exist before EC2 starts.

```bash
# From the infra directory
cd infra

# Install dependencies
npm install

# Bootstrap CDK (first time only)
npx cdk bootstrap
```

#### Phase 1: Deploy infrastructure WITHOUT compute stack

```bash
npx cdk deploy assitech-network-prod assitech-ecr-prod assitech-database-prod assitech-codebuild-prod --require-approval never
```

This creates:
- Network (VPC, subnets, security groups)
- ECR (container registries)
- Database (RDS PostgreSQL)
- CodeBuild (CI/CD pipeline)

#### Build Docker Images

Trigger CodeBuild to build and push Docker images to ECR:

```bash
aws codebuild start-build --project-name assitech-blog-build --region eu-west-3
```

Wait for the build to complete (monitor in AWS Console: CodeBuild → Build projects → assitech-blog-build):

```bash
# Check build status (wait for SUCCEEDED)
aws codebuild list-builds-for-project --project-name assitech-blog-build --region eu-west-3 --query 'ids[0]' --output text | xargs -I {} aws codebuild batch-get-builds --ids {} --region eu-west-3 --query 'builds[0].buildStatus' --output text
```

#### Phase 2: Deploy compute stack AFTER images are ready

```bash
npx cdk deploy assitech-compute-prod --require-approval never
```

> **Why two phases?** The EC2 user-data script runs on first boot and tries to pull Docker images from ECR. If images don't exist yet, the script fails and containers won't start. By building images first, the EC2 instance can successfully pull and run them on startup.

## Post-Deployment

### Access Your Application

After deployment, CDK will output:

```
Outputs:
assitech-compute-prod.ApplicationUrl = http://ec2-xxx.compute-1.amazonaws.com
assitech-compute-prod.AdminUrl = http://ec2-xxx.compute-1.amazonaws.com/login
assitech-compute-prod.InstancePublicIp = xx.xx.xx.xx
```

### First Login

1. Go to Admin URL
2. Email: `admin@assitech.challenge` (or your configured email)
3. Password: Your `ADMIN_PASSWORD` from `.env`
4. **Change password immediately** after first login

### Verify Deployment

```bash
# SSH to instance
ssh -i your-keypair.pem ec2-user@your-instance-ip

# Check containers
docker ps

# View logs
docker logs assitech-backend
docker logs assitech-frontend
```

## Application Management

### Update Application

When you make code changes:

```bash
# 1. Push code changes to GitHub
git add .
git commit -m "Update application"
git push origin main

# 2. CodeBuild automatically builds and pushes new images to ECR
# Monitor build: AWS Console → CodeBuild → assitech-blog-build

# 3. Once build completes, SSH to EC2 and update
ssh -i your-keypair.pem ec2-user@your-instance-ip
/opt/assitech/update.sh
```

The update script pulls the latest images from ECR and restarts containers.

### View Logs

```bash
ssh -i your-keypair.pem ec2-user@your-instance-ip

# Backend logs
docker logs -f assitech-backend

# Frontend logs
docker logs -f assitech-frontend

# Both
cd /opt/assitech
docker-compose logs -f
```

### Reseed Database

Via Admin Dashboard:
- http://your-url/admin/database

Or via CLI:
```bash
ssh -i your-keypair.pem ec2-user@your-instance-ip
docker exec assitech-backend npm run reseed-db
```

### Restart Services

```bash
ssh -i your-keypair.pem ec2-user@your-instance-ip
cd /opt/assitech
docker-compose restart
```

## Database Management

### View Database Credentials

```bash
aws secretsmanager get-secret-value \
  --secret-id assitech/database/credentials \
  --region us-east-1 \
  --query SecretString \
  --output text | jq .
```

### Connect to Database

```bash
# SSH to EC2 (it acts as bastion)
ssh -i your-keypair.pem ec2-user@your-instance-ip

# Install PostgreSQL client
sudo yum install -y postgresql15

# Get DB endpoint from CloudFormation outputs or AWS Console
psql -h your-rds-endpoint.rds.amazonaws.com -U bloguser -d blogdb
```

### Backup Database

Automated daily backups are enabled (7-day retention).

Create manual snapshot:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier your-db-instance-id \
  --db-snapshot-identifier assitech-manual-backup-$(date +%Y%m%d)
```

## Infrastructure Updates

### Update Stack Configuration

1. Modify CDK code in `infra/lib/`
2. Preview changes:
```bash
npm run diff
```

3. Deploy updates:
```bash
npm run deploy
```

### Scale EC2 Instance

Edit `infra/.env`:
```bash
EC2_INSTANCE_TYPE=t3.large  # or t3.small, t3.xlarge, etc.
```

Then redeploy:
```bash
npm run deploy
```

## Monitoring

### CloudWatch Logs

View logs in AWS Console:
1. CloudWatch → Log groups
2. Find `/assitech/docker`
3. View log streams by instance ID

### CloudWatch Metrics

Available metrics:
- EC2: CPU, Network, Disk I/O
- RDS: Connections, CPU, Storage
- Application: Custom metrics via CloudWatch agent

### Application Health

Check health endpoint:
```bash
curl http://your-instance-ip:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Cost Optimization

1. **Stop instances when not in use**:
   ```bash
   aws ec2 stop-instances --instance-ids i-xxx
   aws rds stop-db-instance --db-instance-identifier your-db-id
   ```

2. **Delete after testing**:
   ```bash
   npm run destroy  # Remove all resources
   ```

3. **Use Reserved Instances** (after free tier, 1-3 year commitment):
   - Save up to 75% on EC2 and RDS

4. **Monitor usage**:
   ```bash
   # Check free tier usage
   aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics BlendedCost
   ```

5. **Enable auto-shutdown** for non-production:
   ```bash
   # Add to crontab on EC2
   0 22 * * * /usr/bin/docker-compose -f /opt/assitech/docker-compose.yml stop
   0 8 * * * /usr/bin/docker-compose -f /opt/assitech/docker-compose.yml start
   ```

## Security Best Practices

- **Secrets Management**: All credentials stored in AWS Secrets Manager
- **Encryption**: RDS and EBS volumes encrypted at rest
- **Network Isolation**: Database secured via security groups (EC2-only access)
- **IMDSv2**: Required on EC2 instance
- **Security Groups**: Minimal access rules (least privilege)
- **IAM Roles**: Least-privilege permissions

### Additional Hardening

1. **Restrict SSH access** (modify network-stack.ts):
   ```typescript
   this.appSecurityGroup.addIngressRule(
     ec2.Peer.ipv4('YOUR_IP/32'),  // Your IP only
     ec2.Port.tcp(22),
     'Allow SSH from my IP'
   );
   ```

2. **Enable MFA Delete** for ECR:
   ```bash
   aws ecr put-lifecycle-policy ...
   ```

3. **Setup AWS WAF** for DDoS protection

4. **Enable GuardDuty** for threat detection

## Troubleshooting

### Deployment Fails

**Issue**: CloudFormation stack fails to create

**Solution**:
```bash
# View error details
aws cloudformation describe-stack-events \
  --stack-name assitech-compute-prod \
  --max-items 20

# Check CDK diff
npm run diff

# Destroy failed stack and retry
npx cdk destroy assitech-compute-prod
npm run deploy
```

### Application Not Accessible

**Issue**: Can't access application URL

**Solution**:
```bash
# 1. Check security group allows port 80
aws ec2 describe-security-groups --group-ids sg-xxx

# 2. Verify containers running
ssh -i key.pem ec2-user@instance-ip
docker ps

# 3. Check user data logs
sudo cat /var/log/cloud-init-output.log

# 4. Verify health endpoint
curl localhost:3000/health
```

### Database Connection Failed

**Issue**: Backend can't connect to RDS

**Solution**:
```bash
# 1. Check security group allows traffic from EC2
aws ec2 describe-security-groups --group-ids sg-xxx

# 2. Test connectivity
telnet rds-endpoint.rds.amazonaws.com 5432

# 3. Verify credentials in Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id assitech/database/credentials
```

### Out of Disk Space

**Issue**: EC2 instance out of disk

**Solution**:
```bash
# Clean Docker resources
docker system prune -a --volumes

# Check disk usage
df -h
du -sh /var/lib/docker

# Increase EBS volume (modify compute-stack.ts)
allocatedStorage: 50  # GB
```

## Redeployment (Fresh Start)

If you need to completely redeploy the infrastructure from scratch (e.g., to reset the database or fix deployment issues):

### Step 1: Destroy All Stacks

```bash
cd infra
npx cdk destroy --all --force
```

This removes all CloudFormation stacks. Note that ECR repositories and RDS snapshots may be retained.

### Step 2: Clean Up Retained Resources (Optional)

If you want a completely clean slate, delete retained ECR repositories:

```bash
aws ecr delete-repository --repository-name assitech-backend --force --region eu-west-3
aws ecr delete-repository --repository-name assitech-frontend --force --region eu-west-3
```

### Step 3: Redeploy Using Two-Phase Process

Follow the same two-phase deployment process as initial deployment:

#### Phase 1: Deploy infrastructure WITHOUT compute stack

```bash
npx cdk deploy assitech-network-prod assitech-ecr-prod assitech-database-prod assitech-codebuild-prod --require-approval never
```

#### Build Docker Images

Trigger CodeBuild to build and push images:

```bash
aws codebuild start-build --project-name assitech-blog-build --region eu-west-3
```

Wait for the build to complete (check in AWS Console: CodeBuild → Build projects → assitech-blog-build → Build history, or use the CLI command from Step 4).

#### Phase 2: Deploy compute stack AFTER images are ready

```bash
npx cdk deploy assitech-compute-prod --require-approval never
```

### Step 4: Verify Deployment

```bash
# Get the EC2 instance IP from the deployment output, then:
ssh -i your-keypair.pem ec2-user@your-instance-ip

# Check containers are running
sudo docker ps

# Check backend health
curl http://localhost:3000/health

# Check logs if needed
sudo docker logs assitech-backend
sudo docker logs assitech-frontend
```

## Cleanup

### Destroy All Resources

```bash
cd infra
npm run destroy
```

This removes all resources **except**:
- RDS database (retained for safety)
- ECR repositories (retained for safety)

### Complete Cleanup

To delete everything including database:

1. Delete RDS snapshots:
```bash
aws rds delete-db-snapshot --db-snapshot-identifier snapshot-name
```

2. Delete database (if not already deleted by CDK):
```bash
aws rds delete-db-instance \
  --db-instance-identifier your-db-id \
  --skip-final-snapshot
```

3. Delete ECR repositories:
```bash
aws ecr delete-repository --repository-name assitech-backend --force
aws ecr delete-repository --repository-name assitech-frontend --force
```

4. Remove CDK bootstrap stack (optional):
```bash
aws cloudformation delete-stack --stack-name CDKToolkit
```

## Advanced Topics

### Custom Domain

1. Purchase domain in Route 53
2. Request SSL certificate in ACM
3. Update `.env`:
   ```bash
   DOMAIN_NAME=blog.yourdomain.com
   CERTIFICATE_ARN=arn:aws:acm:xxx
   ```
4. Modify `compute-stack.ts` to add ALB with HTTPS

### Auto Scaling

Replace single EC2 with Auto Scaling Group:
- Modify `compute-stack.ts`
- Use Launch Template
- Add Application Load Balancer
- Configure target tracking scaling

### Multi-Region

Deploy to multiple regions:
```bash
AWS_REGION=us-east-1 npm run deploy
AWS_REGION=eu-west-1 npm run deploy
```

Add Route 53 health checks and failover routing.

### CI/CD Pipeline

Setup automated deployments:
1. Create CodePipeline
2. Connect to GitHub
3. Build images on commit
4. Deploy via CDK

## Support and Resources

- **AWS CDK Docs**: https://docs.aws.amazon.com/cdk/
- **Project README**: `infra/README.md`
- **CloudFormation Console**: View stack resources and events
- **CloudWatch Logs**: `/assitech/docker` log group

## Next Steps

After successful deployment:

1. Change admin password
2. Generate test articles
3. Configure custom domain (optional)
4. Setup monitoring alerts
5. Configure automated backups
6. Review security settings
7. Document your deployment