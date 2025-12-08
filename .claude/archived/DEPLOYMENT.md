# AssiTech Blog - Deployment Guide

Complete guide for deploying AssiTech to AWS EC2 with Docker containers.

## Quick Start

```bash
# 1. Setup EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip
bash ec2-setup.sh

# 2. Configure environment
cd deploy
cp .env.example .env
# Edit .env with your values

# 3. Deploy
./deploy.sh
```

## Detailed Documentation

See `deploy/README.md` for comprehensive deployment instructions including:

- EC2 instance setup
- ECR configuration
- Environment variables
- Deployment automation
- Monitoring and maintenance
- Troubleshooting

## Architecture

```
┌─────────────────────────────────────────┐
│           AWS EC2 Instance              │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │     Nginx (Frontend)             │  │
│  │     Port 80                      │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Node.js API (Backend)           │  │
│  │  Port 3000                       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  PostgreSQL (Database)           │  │
│  │  Port 5432                       │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        AWS ECR (Container Registry)     │
│  - assitech-frontend:latest             │
│  - assitech-backend:latest              │
└─────────────────────────────────────────┘
```

## Project Structure

```
AssiTech/
├── backend/              # Node.js API
├── frontend/             # React app
├── deploy/               # Deployment files
│   ├── README.md         # Detailed deployment guide
│   ├── docker-compose.prod.yml
│   ├── deploy.sh         # Automated deployment script
│   ├── ec2-setup.sh      # EC2 instance setup
│   └── .env.example      # Environment template
└── DEPLOYMENT.md         # This file
```

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Docker installed locally
- SSH key pair for EC2

## Environment Variables

Create `deploy/.env` from `deploy/.env.example`:

```bash
AWS_ACCOUNT_ID=your_account_id
AWS_REGION=us-east-1
EC2_HOST=ec2-xx-xx-xx-xx.compute-1.amazonaws.com
EC2_SSH_KEY=/path/to/key.pem
POSTGRES_PASSWORD=secure_password
HUGGINGFACE_API_KEY=your_key
JWT_SECRET=random_secret
ADMIN_EMAIL=admin@assitech.com
ADMIN_PASSWORD=admin_password
```

## Deployment Steps

### 1. Launch EC2 Instance

- **AMI**: Amazon Linux 2023
- **Type**: t2.medium
- **Storage**: 20 GB
- **Security Group**: Allow ports 22, 80, 3000

### 2. Setup EC2

```bash
scp -i your-key.pem deploy/ec2-setup.sh ec2-user@your-ec2-ip:~/
ssh -i your-key.pem ec2-user@your-ec2-ip
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### 3. Configure & Deploy

```bash
cd deploy
cp .env.example .env
nano .env  # Update with your values
chmod +x deploy.sh
./deploy.sh
```

### 4. Access Application

- Frontend: http://your-ec2-ip
- API: http://your-ec2-ip:3000/health
- Admin: http://your-ec2-ip/login

## Features

- ✅ AI-powered article generation
- ✅ Admin dashboard with authentication
- ✅ Database management interface
- ✅ Automatic article scheduling
- ✅ Image integration with Unsplash
- ✅ Duplicate prevention system
- ✅ Docker containerized
- ✅ Production-ready configuration

## Maintenance

### Update Application

```bash
cd deploy
./deploy.sh
```

### View Logs

```bash
docker logs -f assitech-backend-prod
```

### Backup Database

```bash
docker exec assitech-postgres-prod pg_dump -U bloguser blogdb > backup.sql
```

### Reseed Database

Via Admin Dashboard: http://your-ec2-ip/admin/database

Or CLI:
```bash
docker exec assitech-backend-prod npm run reseed-db
```

## Monitoring

Check container health:
```bash
docker ps
docker stats
```

View logs:
```bash
docker logs assitech-backend-prod --tail 100
docker logs assitech-frontend-prod --tail 100
```

## Troubleshooting

See `deploy/README.md` for detailed troubleshooting guide.

Common issues:
- Cannot connect → Check security group
- Database error → Check .env credentials
- ECR auth failed → Re-run `aws ecr get-login-password`

## Security

- Change admin password after first login
- Use strong, unique passwords
- Restrict SSH to your IP
- Keep system updated
- Enable HTTPS for production

## Cost Estimate

- EC2 t2.medium: ~$33/month
- ECR storage: ~$0.10/GB/month
- Data transfer: First 100 GB free

## Support

For detailed documentation, see:
- `deploy/README.md` - Complete deployment guide
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation
