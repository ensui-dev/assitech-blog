# AssiTech Blog - AI-Generated Blog Platform

A full-stack auto-generated blog application powered by AI, built with React, Node.js, PostgreSQL, and deployed on AWS infrastructure.

## Features

- **AI-Powered Content**: Automatically generates tech articles using HuggingFace's Llama 3.1-8B model (free tier)
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
- **React Markdown** - Markdown rendering
- **Nginx** - Production web server

### Backend
- **Node.js 20** - Runtime environment
- **Express** - Web framework
- **PostgreSQL 16** - Database
- **node-cron** - Job scheduling
- **HuggingFace API** - AI text generation (Llama 3.1-8B)
- **Unsplash API** - Article images

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
├── backend/                      # Node.js backend application
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # PostgreSQL connection config
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── Article.js        # Article database model
│   │   │   └── User.js           # User database model
│   │   ├── routes/
│   │   │   ├── admin.js          # Admin API routes
│   │   │   ├── articles.js       # Article CRUD routes
│   │   │   └── auth.js           # Authentication routes
│   │   ├── services/
│   │   │   ├── aiClient.js       # HuggingFace API integration
│   │   │   ├── articleJob.js     # Cron job for article generation
│   │   │   └── unsplashClient.js # Unsplash API for images
│   │   ├── utils/
│   │   │   ├── initDb.js         # Database initialization
│   │   │   └── reseedDb.js       # Database reseeding utility
│   │   └── index.js              # Application entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios API client
│   │   ├── components/
│   │   │   ├── ArticleCard.jsx   # Article preview card
│   │   │   ├── ErrorMessage.jsx  # Error display component
│   │   │   ├── Header.jsx        # Navigation header
│   │   │   ├── Loading.jsx       # Loading spinner
│   │   │   └── ProtectedRoute.jsx# Auth route wrapper
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Authentication state
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── ArticleEditor.jsx    # Create/edit articles
│   │   │   │   ├── ArticleGenerator.jsx # AI article generator
│   │   │   │   ├── ArticleManagement.jsx# Article list management
│   │   │   │   └── DatabaseManager.jsx  # Database admin tools
│   │   │   ├── AdminDashboard.jsx       # Admin home page
│   │   │   ├── ArticleDetail.jsx        # Single article view
│   │   │   ├── Home.jsx                 # Public home page
│   │   │   └── Login.jsx                # Admin login page
│   │   ├── styles/
│   │   │   └── App.css           # Global styles
│   │   ├── App.jsx               # Main app with routing
│   │   └── main.jsx              # React entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf                # Production nginx config
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
│
├── infra/                        # AWS CDK Infrastructure
│   ├── bin/
│   │   └── app.ts                # CDK app entry point
│   ├── lib/
│   │   ├── network-stack.ts      # VPC, subnets, security groups
│   │   ├── ecr-stack.ts          # Container registries
│   │   ├── codebuild-stack.ts    # CI/CD build pipeline
│   │   ├── database-stack.ts     # RDS PostgreSQL
│   │   └── compute-stack.ts      # EC2 instance
│   ├── scripts/
│   │   ├── build-and-push.sh     # Docker build script
│   │   ├── deploy.sh             # Deployment automation
│   │   ├── init-ec2.sh           # EC2 setup script
│   │   └── user-data.sh          # EC2 cloud-init
│   ├── .env.example
│   ├── buildspec.yml             # CodeBuild specification
│   ├── cdk.json
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
│
├── docs/                         # Documentation
│   ├── deployment/
│   │   ├── AWS_DEPLOYMENT.md     # AWS deployment guide
│   │   └── LOCAL_DEPLOYMENT.md   # Local setup guide
│   ├── ARCHITECTURE.md           # System architecture
│   └── README.md                 # Documentation index
│
├── .env.example                  # Root environment template
├── docker-compose.yml            # Local development orchestration
├── CHALLENGE.md                  # Original challenge requirements
├── SUBMISSION_CHECKLIST.md       # Pre-submission checklist
└── README.md                     # This file
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
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@assitech.challenge
ADMIN_PASSWORD=Admin123@
ARTICLE_GENERATION_CRON=0 2 * * *
```

### Frontend (.env)
```env
VITE_API_URL=   # Leave empty for production (uses nginx proxy)
```

### Admin Credentials (Production)
```
Email: admin@assitech.challenge
Password: Admin123@
```

## Features & Implementation

### Automatic Article Generation

The system uses **node-cron** to automatically generate one new article every day at 2 AM (configurable). The cron job:

1. Generates a unique tech topic using AI (or falls back to predefined list)
2. Calls HuggingFace API to generate article content
3. Generates a summary of the article
4. Fetches a relevant image from Unsplash API
5. Saves to PostgreSQL database
6. Falls back to template articles if API fails

### AI Integration

Uses HuggingFace's Inference API with Llama 3.1-8B-Instruct model via OpenAI-compatible endpoint:
- Free tier with monthly credits
- High-quality text generation
- OpenAI-compatible chat completions API (`router.huggingface.co/v1/chat/completions`)
- Includes fallback mechanism for reliability

### Database Schema

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  author VARCHAR(100) DEFAULT 'AI Writer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

## Documentation

Complete documentation is available in the [docs/](docs/) directory:

### Main Guides
- **[Documentation Index](docs/README.md)** - Complete documentation overview and quick links
- **[Architecture](docs/ARCHITECTURE.md)** - System design, data flow, and component interactions

### Deployment Guides
- **[AWS Deployment](docs/deployment/AWS_DEPLOYMENT.md)** - Full AWS deployment walkthrough with CDK
- **[Local Deployment](docs/deployment/LOCAL_DEPLOYMENT.md)** - Local development setup with Docker

### Component Documentation
- **[Backend README](backend/README.md)** - API endpoints, services, and backend architecture
- **[Frontend README](frontend/README.md)** - React components, routing, and styling
- **[Infrastructure README](infra/README.md)** - AWS CDK stacks, resources, and deployment scripts

### Quick References
- **[infra/QUICKSTART.md](infra/QUICKSTART.md)** - 6-step quick deployment guide
- **[CHALLENGE.md](CHALLENGE.md)** - Original challenge requirements
- **[SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)** - Pre-submission verification list

## Future Improvements

- Add HTTPS with Let's Encrypt
- Implement caching with Redis
- Add categories and tags
- Include search functionality
- Set up CloudWatch alarms
- Implement automated backups
- Add comment system
- Improve AI prompts for better content
- Add more diverse topics

## Contributing

This is a technical challenge submission. If you're evaluating it, thank you for your time!

## Contact

For questions or feedback about this implementation, please reach out via the submission email.