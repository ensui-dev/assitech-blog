# AssiTech Blog - AI-Generated Blog Platform

A full-stack auto-generated blog application powered by AI, built with React, Node.js, PostgreSQL, and deployed on AWS infrastructure.

## Features

- **AI-Powered Content**: Automatically generates tech articles using HuggingFace's free Mistral model
- **Daily Automation**: Generates one new article every day using node-cron
- **Modern Stack**: React + Vite frontend, Node.js + Express backend, PostgreSQL database
- **Containerized**: Fully Dockerized application with Docker Compose support
- **AWS Deployment**: Production-ready deployment on EC2 with CodeBuild and ECR
- **Responsive Design**: Clean, modern UI that works on all devices

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Nginx** - Production web server

### Backend
- **Node.js 20** - Runtime environment
- **Express** - Web framework
- **PostgreSQL 16** - Database
- **node-cron** - Job scheduling
- **HuggingFace API** - AI text generation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **AWS CDK** - Infrastructure as Code
- **AWS EC2** - Compute hosting
- **AWS RDS** - PostgreSQL database
- **AWS ECR** - Container registry
- **AWS Secrets Manager** - Credential management
- **AWS CloudWatch** - Monitoring and logs

## Project Structure

```
AssiTech/
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (AI client, cron jobs)
│   │   ├── utils/           # Utility functions (DB initialization)
│   │   └── index.js         # Application entry point
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS styles
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx configuration
│   ├── package.json
│   └── README.md
│
├── infra/                    # AWS CDK Infrastructure
│   ├── bin/
│   │   └── app.ts           # CDK app entry point
│   ├── lib/
│   │   ├── network-stack.ts # VPC, subnets, security groups
│   │   ├── ecr-stack.ts     # Container registries
│   │   ├── codebuild-stack.ts# CI/CD pipeline
│   │   ├── database-stack.ts# RDS PostgreSQL
│   │   └── compute-stack.ts # EC2 instance
│   ├── scripts/
│   │   ├── build-and-push.sh# Build and push Docker images
│   │   └── user-data.sh     # EC2 initialization
│   ├── package.json
│   ├── README.md            # Detailed deployment guide
│   └── QUICKSTART.md        # Quick deployment guide
│
├── docs/                     # Documentation
│   ├── README.md            # Documentation index
│   ├── ARCHITECTURE.md      # System architecture
│   ├── deployment/          # Deployment guides
│   └── reference/           # Reference guides
│
├── docker-compose.yml        # Local development orchestration
├── CHALLENGE.md              # Original challenge requirements
├── SUBMISSION_CHECKLIST.md   # Pre-submission checklist
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 16+ (if running without Docker)
- HuggingFace API key (free - get it at https://huggingface.co/settings/tokens)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AssiTech
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your HuggingFace API key:
   ```env
   HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
   ```

3. **Start the application with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL on port 5432
   - Backend API on port 3000
   - Frontend on port 80

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Manual Setup (Without Docker)

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run init-db  # Initialize database and seed data
npm start        # Start the server
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev      # Start development server
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status

### Articles
```
GET /api/articles
```
Get all articles (ordered by newest first)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

```
GET /api/articles/:id
```
Get a specific article by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Article Title",
    "content": "...",
    "summary": "...",
    "author": "AI Writer",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

```
POST /api/articles
```
Manually trigger article generation

## AWS Deployment

Deploy to AWS using Infrastructure as Code with AWS CDK.

### Quick Deploy (6 Steps)

```bash
# 1. Install CDK dependencies
cd infra && npm install

# 2. Configure environment (including GitHub token for CodeBuild)
cp .env.example .env && nano .env

# 3. Bootstrap CDK (first time only)
npx cdk bootstrap

# 4. Deploy infrastructure
npm run deploy

# 5. Build and push Docker images via CodeBuild
aws codebuild start-build --project-name assitech-blog-build

# 6. Access your application at the URL shown in deployment output
```

### What Gets Deployed

- **VPC**: Multi-AZ with public subnets (no NAT Gateway)
- **RDS PostgreSQL**: Managed database with automated backups (secured via security groups)
- **ECR**: Docker container registries
- **CodeBuild**: CI/CD pipeline for automated builds
- **EC2**: Application server with auto-configuration
- **Secrets Manager**: Secure credential storage
- **CloudWatch**: Monitoring and logs

### Cost

**AWS Free Tier (First 12 Months)**: ~$0.80/month (Secrets Manager only)
- **100% free tier optimized**: t2.micro EC2, db.t3.micro RDS, no NAT Gateway
- **First 30 days**: $0/month (completely free)
- **After 30 days**: ~$0.80/month (Secrets Manager only)
- **After free tier expires**: ~$22-24/month
- Most services covered under AWS Free Tier (first 12 months)
- See [infra/README.md](infra/README.md#cost-estimate) for detailed breakdown

### Full Documentation

- **Quick Start**: [infra/QUICKSTART.md](infra/QUICKSTART.md)
- **Detailed Guide**: [docs/deployment/AWS_DEPLOYMENT.md](docs/deployment/AWS_DEPLOYMENT.md)
- **Infrastructure Docs**: [infra/README.md](infra/README.md)
- **All Documentation**: [docs/README.md](docs/README.md)

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpassword
POSTGRES_DB=blogdb
HUGGINGFACE_API_KEY=your_key_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
ARTICLE_GENERATION_CRON=0 2 * * *
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## Features & Implementation

### Automatic Article Generation

The system uses **node-cron** to automatically generate one new article every day at 2 AM (configurable). The cron job:

1. Selects a random tech topic from a predefined list
2. Calls HuggingFace API to generate article content
3. Generates a summary of the article
4. Saves to PostgreSQL database
5. Falls back to template articles if API fails

### AI Integration

Uses HuggingFace's free Inference API with the Mistral-7B-Instruct model:
- Zero cost
- No rate limits for reasonable usage
- Generates high-quality tech content
- Includes fallback mechanism for reliability

### Database Schema

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author VARCHAR(100) DEFAULT 'AI Writer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Test Backend
```bash
# Health check
curl http://localhost:3000/health

# Get articles
curl http://localhost:3000/api/articles

# Manually trigger article generation
curl -X POST http://localhost:3000/api/articles
```

### Test Frontend
Open http://localhost in your browser

## Monitoring & Logs

### View Docker Logs
```bash
# Backend logs
docker logs -f assitech-backend

# Frontend logs
docker logs -f assitech-frontend

# Database logs
docker logs -f assitech-postgres
```

### Check Container Status
```bash
docker ps
docker stats
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check backend can connect
docker exec assitech-backend npm run init-db
```

### API Not Responding
```bash
# Check backend logs
docker logs assitech-backend

# Restart backend
docker restart assitech-backend
```

### Frontend Not Loading
```bash
# Check nginx logs
docker logs assitech-frontend

# Verify backend is accessible
curl http://localhost:3000/health
```

## Cost Estimation (AWS)

- **EC2 t2.micro**: Free tier eligible (750 hours/month)
- **ECR Storage**: ~$0.10/GB/month (minimal for 2 images)
- **CodeBuild**: 100 build minutes/month free
- **Data Transfer**: Minimal costs for personal use
- **HuggingFace API**: $0 (free tier)

**Total Monthly Cost**: ~$0-5 (mostly free tier)

## Documentation

Complete documentation is available in the [docs/](docs/) directory:

### Main Guides
- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[AWS Deployment](docs/deployment/AWS_DEPLOYMENT.md)** - Complete deployment guide
- **[Deployment Summary](docs/deployment/DEPLOYMENT_SUMMARY.md)** - Implementation overview

### Quick References
- **[Challenge Requirements](CHALLENGE.md)** - Original challenge specifications
- **[Submission Checklist](SUBMISSION_CHECKLIST.md)** - Pre-submission verification
- **[Infrastructure Quick Start](infra/QUICKSTART.md)** - 5-step deployment
- **[WSL Troubleshooting](docs/reference/TROUBLESHOOTING_WSL.md)** - Docker on Windows/WSL

### Component Docs
- **[Backend README](backend/README.md)** - Backend API documentation
- **[Frontend README](frontend/README.md)** - Frontend documentation
- **[Infrastructure README](infra/README.md)** - Infrastructure documentation

## Future Improvements

- Add user authentication and admin panel
- Implement article editing and deletion
- Add categories and tags
- Include search functionality
- Implement caching with Redis
- Add SSL/HTTPS with Let's Encrypt
- Set up CloudWatch monitoring
- Implement automated backups
- Add comment system
- Improve AI prompts for better content
- Add more diverse topics
- Implement article images/thumbnails

## Contributing

This is a technical challenge submission. If you're evaluating it, thank you for your time!

## Contact

For questions or feedback about this implementation, please reach out via the submission email.