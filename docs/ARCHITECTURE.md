# Architecture Documentation

## System Overview

AssiTech Blog is a full-stack web application that automatically generates and displays tech blog articles using AI. The system consists of three main components: Frontend (React), Backend (Node.js), and Database (PostgreSQL), all containerized with Docker and deployed on AWS infrastructure.

## High-Level Architecture

**Local Development**:
```
              ┌──────────────┐
              │  Developer   │
              │  (Browser)   │
              └──────┬───────┘
                     │ HTTP (localhost:80)
                     ▼
┌─────────────────────────────────────────┐
│        Docker Compose (Local)           │
│                                         │
│  ┌────────────┐  ┌────────────┐         │
│  │  Frontend  │  │  Backend   │         │
│  │  (Nginx)   │◄─┤  (Node.js) │         │
│  │  Port 80   │  │ Port 3000  │         │
│  └────────────┘  └─────┬──────┘         │
│                        │                │
│                  ┌─────▼──────┐         │
│                  │ PostgreSQL │         │
│                  │  Port 5432 │         │
│                  └────────────┘         │
└─────────────────────────────────────────┘
                     │
                     │ API Calls (from Backend)
                     ▼
       ┌─────────────────────────────────┐
       │       External APIs             │
       │                                 │
       │  ┌────────────┐ ┌────────────┐  │
       │  │ HuggingFace│ │  Unsplash  │  │
       │  │  API (AI)  │ │API (Images)│  │
       │  └────────────┘ └────────────┘  │
       └─────────────────────────────────┘
```

**AWS Production Deployment**:
```
                     ┌──────────────┐
                     │   Internet   │
                     │    Users     │
                     └──────┬───────┘
                            │ HTTP (Port 80)
                            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         AWS Cloud (eu-west-3)                             │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        VPC (Public Subnets)                         │  │
│  │                                                                     │  │
│  │    ┌─────────────────────────────────────────────────────────┐      │  │
│  │    │              EC2 Instance (t2.micro)                    │      │  │
│  │    │                                                         │      │  │
│  │    │   ┌──────────────┐      ┌──────────────┐                │      │  │
│  │    │   │   Frontend   │      │   Backend    │                │      │  │
│  │    │   │   (Nginx)    │◄────►│  (Node.js)   │                │      │  │
│  │    │   │   Port 80    │      │  Port 3000   │                │      │  │
│  │    │   └──────────────┘      └──────┬───────┘                │      │  │
│  │    │                                │                        │      │  │
│  │    └────────────────────────────────┼────────────────────────┘      │  │
│  │                                     │ SQL Queries                   │  │
│  │    ┌────────────────────────────────▼────────────────────────┐      │  │
│  │    │         RDS PostgreSQL (db.t3.micro)                    │      │  │
│  │    │         (Security Group: EC2-only access)               │      │  │
│  │    └─────────────────────────────────────────────────────────┘      │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│    ┌─────────────────────────────────────────────────────────────────┐    │
│    │                    AWS Services Connections                     │    │
│    │                                                                 │    │
│    │   ┌────────────┐         ┌────────────┐         ┌────────────┐  │    │
│    │   │  Secrets   │         │    ECR     │         │ CloudWatch │  │    │
│    │   │  Manager   │         │ (Images)   │         │  (Logs)    │  │    │
│    │   │            │         │            │         │            │  │    │
│    │   │ • DB Creds │         │ • backend  │         │ /assitech/ │  │    │
│    │   │ • API Keys │         │ • frontend │         │   docker   │  │    │
│    │   │ • JWT      │         │            │         │            │  │    │
│    │   └─────▲──────┘         └──────▲─────┘         └─────▲──────┘  │    │
│    │         │                       │                     │         │    │
│    │         │ Reads                 │ Pulls               │ Sends   │    │
│    │         │ (on startup)          │ (on startup/update) │ (logs)  │    │
│    │         │                       │                     │         │    │
│    │         └───────────────────────┴─────────────────────┘         │    │
│    │                                 │                               │    │
│    │                    EC2 Instance (via IAM Role)                  │    │
│    └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│    ┌─────────────────────────────────────────────────────────────────┐    │
│    │                      CI/CD Pipeline                             │    │
│    │                                                                 │    │
│    │   ┌────────────┐         ┌────────────┐         ┌────────────┐  │    │
│    │   │   GitHub   │  Push   │ CodeBuild  │  Push   │    ECR     │  │    │
│    │   │            │────────►│            │────────►│            │  │    │
│    │   │ (Source)   │ Webhook │ (Builds    │ Images  │ (Stores    │  │    │
│    │   │            │         │  Docker)   │         │  Images)   │  │    │
│    │   └────────────┘         └────────────┘         └────────────┘  │    │
│    │                                                                 │    │
│    └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls (from Backend)
                            ▼
              ┌─────────────────────────────────┐
              │       External APIs             │
              │                                 │
              │  ┌────────────┐ ┌────────────┐  │
              │  │ HuggingFace│ │  Unsplash  │  │
              │  │  API (AI)  │ │API (Images)│  │
              │  │            │ │            │  │
              │  │ Article    │ │ Article    │  │
              │  │ Generation │ │ Images     │  │
              │  └────────────┘ └────────────┘  │
              └─────────────────────────────────┘
```

**Data Flow Summary**:
1. **Internet → EC2**: Users access the application via HTTP (port 80)
2. **EC2 → RDS**: Backend makes SQL queries to PostgreSQL database
3. **EC2 → Secrets Manager**: Reads credentials on startup (DB creds, API keys, JWT secret)
4. **EC2 → ECR**: Pulls Docker images on startup and when running update script
5. **EC2 → CloudWatch**: Sends container logs via CloudWatch Agent
6. **Backend → HuggingFace**: Makes API calls to generate article content
7. **Backend → Unsplash**: Makes API calls to fetch article images
8. **GitHub → CodeBuild**: Webhook triggers build on code push
9. **CodeBuild → ECR**: Builds and pushes Docker images

## Component Architecture

### Frontend Layer

**Technology**: React 18 + Vite + Nginx

**Structure**:
```
frontend/src/
├── api/                    # API client layer
│   └── client.js          # Axios-based HTTP client
├── components/             # Reusable UI components
│   ├── ArticleCard.jsx    # Article preview card
│   ├── ErrorMessage.jsx   # Error display component
│   ├── Header.jsx         # Navigation header
│   ├── Loading.jsx        # Loading spinner
│   └── ProtectedRoute.jsx # Route authentication guard
├── contexts/               # React Context providers
│   └── AuthContext.jsx    # Authentication state management
├── pages/                  # Route-level components
│   ├── admin/             # Admin panel pages
│   │   ├── ArticleEditor.jsx      # Edit existing articles
│   │   ├── ArticleGenerator.jsx   # AI article generation
│   │   ├── ArticleManagement.jsx  # Article CRUD operations
│   │   └── DatabaseManager.jsx    # Database reseed/management
│   ├── AdminDashboard.jsx # Admin dashboard overview
│   ├── ArticleDetail.jsx  # Single article view
│   ├── Home.jsx           # Public article list
│   └── Login.jsx          # User authentication
├── styles/                 # CSS stylesheets
│   └── App.css
├── App.jsx                 # Main application component
└── main.jsx                # Application entry point
```

**Key Features**:
- Single Page Application (SPA) with client-side routing
- JWT-based authentication with protected routes
- Admin dashboard with full CRUD operations
- AI-powered article generation interface
- Database management and reseeding tools
- Responsive design for mobile and desktop
- Error boundaries and loading states
- Production build served by Nginx
- API requests proxied to backend

**Data Flow**:
1. User navigates to page
2. React component mounts
3. API client fetches data from backend
4. State updates trigger re-render
5. UI displays data or loading/error states

### Backend Layer

**Technology**: Node.js 20 + Express + PostgreSQL

**Structure**:
```
backend/src/
├── config/
│   └── database.js           # PostgreSQL connection pool
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── Article.js            # Article data model
│   └── User.js               # User data model
├── routes/
│   ├── admin.js              # Admin API endpoints
│   ├── articles.js           # Article CRUD endpoints
│   └── auth.js               # Authentication endpoints
├── services/
│   ├── aiClient.js           # HuggingFace API integration
│   ├── articleJob.js         # Cron job scheduler
│   └── unsplashClient.js     # Unsplash image API
├── utils/
│   ├── initDb.js             # Database initialization
│   └── reseedDb.js           # Database reseeding
└── index.js                  # Express application
```

**Key Features**:
- RESTful API design
- JWT-based authentication
- Role-based access control (admin routes)
- Connection pooling for database
- Async/await error handling
- Health check endpoint
- CORS enabled for frontend
- Environment-based configuration
- Automated article generation with cron jobs
- Image integration via Unsplash API

**API Endpoints**:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /health | Health check | No |
| POST | /api/auth/login | User login | No |
| POST | /api/auth/register | User registration | No |
| GET | /api/articles | List all articles | No |
| GET | /api/articles/:id | Get single article | No |
| POST | /api/articles | Create article | Yes (Admin) |
| PUT | /api/articles/:id | Update article | Yes (Admin) |
| DELETE | /api/articles/:id | Delete article | Yes (Admin) |
| POST | /api/admin/generate | Generate AI article | Yes (Admin) |
| POST | /api/admin/reseed | Reseed database | Yes (Admin) |

**Request/Response Flow**:
```
Client Request
    ↓
Express Middleware (CORS, JSON parsing)
    ↓
Route Handler
    ↓
Model Layer (Database Query)
    ↓
Response Formatting
    ↓
Client Response
```

### Database Layer

**Technology**: PostgreSQL 16

**Connection Configuration**:

The database connection automatically handles SSL based on the host:

| Environment | Host | SSL | Reason |
|-------------|------|-----|--------|
| Local (Docker) | `postgres` | Disabled | Local PostgreSQL doesn't support SSL |
| Local (native) | `localhost` | Disabled | Local PostgreSQL doesn't support SSL |
| AWS (RDS) | `*.rds.amazonaws.com` | Enabled | AWS RDS requires SSL connections |

This is handled in `backend/src/config/database.js`:
```javascript
const isLocalDb = host === 'localhost' || host === 'postgres' || host === '127.0.0.1';
const useSSL = isProduction && !isLocalDb;
```

**Schema**:
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

CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
```

**Design Decisions**:
- `SERIAL` primary key for auto-incrementing IDs
- `TEXT` for content to allow unlimited length
- Index on `created_at` for efficient sorting
- Timestamps for audit trail
- Default author for AI-generated content

### AI Integration Layer

**Technology**: HuggingFace Inference API

**Model**: microsoft/Phi-3-mini-4k-instruct

**Implementation**:
```javascript
aiClient.generateArticle()
    ↓
1. Select random topic from predefined list
    ↓
2. Construct prompt for article generation
    ↓
3. Call HuggingFace API
    ↓
4. Generate article summary (second API call)
    ↓
5. Return {title, content, summary}
    ↓
6. Fallback to template if API fails
```

**Features**:
- Zero-cost AI generation
- Fallback mechanism for reliability
- Diverse topic selection
- Quality content generation
- Summary generation for previews

### Automation Layer

**Technology**: node-cron

**Schedule**: Daily at 2:00 AM (configurable)

**Job Flow**:
```
Cron Trigger (2:00 AM daily)
    ↓
Check if job already running
    ↓
Generate article via AI client
    ↓
Save to database
    ↓
Log success/failure
```

**Configuration**:
```javascript
cron.schedule('0 2 * * *', async () => {
  await articleJob.generateAndSaveArticle();
});
```

## Data Flow

### Article Listing Flow

```
User visits homepage
    ↓
Frontend: Home.jsx component mounts
    ↓
API call: GET /api/articles
    ↓
Backend: articlesRouter handles request
    ↓
Database: Article.getAll() queries PostgreSQL
    ↓
Backend: Returns JSON response
    ↓
Frontend: Updates state with articles
    ↓
UI: Renders ArticleCard components
```

### Article Detail Flow

```
User clicks Article Card
    ↓
React Router navigates to /article/:id
    ↓
Frontend: ArticleDetail.jsx component mounts
    ↓
API call: GET /api/articles/:id
    ↓
Backend: articlesRouter handles request
    ↓
Database: Article.getById(id) queries PostgreSQL
    ↓
Backend: Returns single article JSON
    ↓
Frontend: Updates state with article
    ↓
UI: Renders full article content
```

### Automatic Generation Flow

```
Cron Schedule Triggers (Daily 2 AM)
    ↓
articleJob.generateAndSaveArticle()
    ↓
aiClient.generateArticle()
    ↓
HuggingFace API call (article content)
    ↓
HuggingFace API call (summary)
    ↓
Article.create() saves to database
    ↓
Log success with article ID and title
```

## Docker Architecture

### Container Structure

**For Local Development (docker-compose)**:

The local development environment uses a **three-container system**:

1. **Frontend Container** (assitech-frontend)
   - Base: nginx:alpine
   - Serves static React build
   - Proxies /api requests to backend
   - Port: 80
   - Network: assitech-network

2. **Backend Container** (assitech-backend)
   - Base: node:20-alpine
   - Runs Express server
   - Connects to PostgreSQL container
   - Runs cron jobs for article generation
   - Port: 3000
   - Network: assitech-network

3. **PostgreSQL Container** (assitech-postgres)
   - Base: postgres:16-alpine
   - Persistent volume for data
   - Port: 5432
   - Network: assitech-network

**For AWS Deployment**:

The AWS deployment uses a **two-container system** on EC2:

1. **Frontend Container** (assitech-frontend)
   - Runs on EC2 instance
   - Port: 80

2. **Backend Container** (assitech-backend)
   - Runs on EC2 instance
   - Port: 3000
   - Connects to **RDS PostgreSQL** (separate managed service)

> **Note**: In AWS, PostgreSQL runs as a managed RDS instance, NOT in a container.

### Docker Networking

**Local Development (docker-compose)**:

```
assitech-network (Bridge Network)
    │
    ├── assitech-backend (node)
    │   └── Connects to: assitech-postgres:5432
    │
    ├── assitech-frontend (nginx)
    │   └── Proxies to: assitech-backend:3000
    │
    └── assitech-postgres
        └── Volume: postgres_data
```

**Network Configuration**:
- All containers on custom bridge network: `assitech-network`
- Containers communicate via service names
- Frontend proxies API requests to `assitech-backend:3000`
- Backend connects to `assitech-postgres:5432`
- Only frontend exposed to host network (port 80)

**AWS Deployment**:

```
EC2 Instance
    │
    ├── assitech-backend (node)
    │   └── Connects to: RDS_ENDPOINT:5432
    │
    └── assitech-frontend (nginx)
        └── Proxies to: assitech-backend:3000
```

**Network Configuration**:
- Containers on default Docker bridge network
- Frontend proxies to `assitech-backend:3000`
- Backend connects to RDS via endpoint (e.g., `xxx.rds.amazonaws.com:5432`)
- RDS connection secured via VPC security groups

### Volume Management

**Local Development**:
```
Volumes:
  postgres_data/
    └── Persists PostgreSQL database files across container restarts
```

**AWS Deployment**:
- No PostgreSQL volume needed (RDS manages storage)
- RDS uses EBS volumes with automated backups
- Container logs shipped to CloudWatch

## AWS Deployment Architecture

### Infrastructure Overview

The application is deployed on AWS using Infrastructure as Code (AWS CDK) with 5 stacks:

```
AWS Cloud (eu-west-3)
├── VPC (Multi-AZ, Public Subnets)
│   └── Public Subnet
│       ├── EC2 Instance (Docker Containers)
│       │   ├── Frontend (Nginx:80)
│       │   └── Backend (Node.js:3000)
│       └── RDS PostgreSQL (Security Group Protected)
├── ECR (Container Registries)
│   ├── assitech-backend:latest
│   └── assitech-frontend:latest
├── CodeBuild (CI/CD Pipeline)
├── Secrets Manager (Credentials)
└── CloudWatch (Logs & Monitoring)
```

### Infrastructure Components

1. **Network Stack**
   - VPC with public subnets across 2 AZs
   - No NAT Gateway (free tier optimization)
   - Security Groups:
     - **Application SG**: Ports 22, 80, 443, 3000
     - **Database SG**: Port 5432 (EC2-only access)

2. **ECR Stack**
   - Repositories:
     - assitech-backend
     - assitech-frontend
   - Image scanning enabled
   - Lifecycle policy: Keep last 10 images
   - Tags: latest, commit-hash

3. **CodeBuild Stack**
   - GitHub webhook integration
   - Automated builds on push to main
   - Docker layer caching
   - Builds and pushes to ECR
   - Uses buildspec.yml

4. **Database Stack**
   - RDS PostgreSQL 16 (db.t3.micro)
   - Public subnet, security group protected
   - 7-day automated backups
   - Performance Insights disabled (free tier)
   - Credentials in Secrets Manager
   - 20 GB storage (auto-scaling to 100 GB)

5. **Compute Stack**
   - EC2 t2.micro (free tier eligible)
   - Amazon Linux 2023
   - Docker + Docker Compose pre-installed
   - IAM role with ECR and Secrets Manager access
   - User data script for auto-configuration
   - CloudWatch agent for log shipping

### Deployment Pipeline

**Initial Deployment (AWS CDK)**:
```
1. Configure environment (.env)
    ↓
2. Bootstrap CDK (first time)
    ↓
3. Deploy all 5 stacks (npm run deploy)
    ↓
4. Network → ECR → CodeBuild → Database → Compute
    ↓
5. EC2 user data script runs automatically:
   - Install Docker & Docker Compose
   - Fetch secrets from Secrets Manager
   - Login to ECR
   - Pull container images
   - Create docker-compose.yml
   - Start containers
   - Initialize database
```

**Continuous Deployment (GitHub → CodeBuild → ECR)**:
```
Developer pushes code to GitHub
    ↓
GitHub webhook triggers CodeBuild
    ↓
CodeBuild: Build Docker images (buildspec.yml)
    ↓
CodeBuild: Tag images (latest + commit hash)
    ↓
CodeBuild: Push to ECR repositories
    ↓
Manual step: SSH to EC2 instance
    ↓
Run update script: /opt/assitech/update.sh
    ↓
Pull latest images from ECR
    ↓
Stop old containers
    ↓
Start new containers with latest images
    ↓
Application updated on EC2
```

### CI/CD Flow

**buildspec.yml phases**:

1. **pre_build**
   - Login to ECR
   - Set environment variables
   - Get commit hash for tagging

2. **build**
   - Build backend Docker image
   - Build frontend Docker image
   - Tag images

3. **post_build**
   - Push images to ECR
   - Create image definitions file
   - Cache npm modules

### Scaling Considerations

**Current Architecture**: Single EC2 + RDS

**Future Scaling Options**:

1. **Horizontal Scaling**:
   - Add Application Load Balancer (ALB)
   - Auto Scaling Group (ASG) with multiple EC2 instances
   - Multi-AZ deployment for high availability

2. **Database Scaling**:
   - RDS read replicas for read-heavy workloads
   - Increase instance size (db.t3.small, db.t3.medium)
   - Enable Performance Insights for optimization
   - Aurora PostgreSQL for serverless scaling

3. **Caching Layer**:
   - Add ElastiCache (Redis/Memcached)
   - Cache article listings and details
   - Reduce database load and improve response times

4. **CDN & Static Assets**:
   - CloudFront distribution for frontend
   - S3 for static asset storage
   - Edge caching for global users
   - Lower bandwidth costs

## Security Considerations

### Application Security

1. **Environment Variables**
   - Sensitive data not in code
   - .env files not committed
   - Secrets managed per environment

2. **API Security**
   - CORS configured
   - Input validation
   - Error messages sanitized
   - Rate limiting (future)

3. **Database Security**
   - Parameterized queries (SQL injection prevention)
   - Connection pooling
   - Minimal privileges

### Infrastructure Security

1. **AWS Security Best Practices**
   - Secrets Manager for all credentials
   - RDS and EBS encryption at rest
   - Security groups with least privilege
   - IMDSv2 required on EC2
   - IAM roles (no embedded credentials)
   - ECR image scanning enabled

2. **Network Security**
   - Security group for EC2: Ports 22, 80, 443, 3000
   - Security group for RDS: Port 5432 (EC2-only access)
   - RDS in public subnet but NOT publicly accessible
   - Private Docker network for container communication
   - HTTPS with ALB + ACM certificate (future enhancement)

3. **Container Security**
   - Non-root user in containers
   - Minimal base images (Alpine)
   - No unnecessary packages
   - Regular image updates
   - ECR vulnerability scanning

4. **Access Control**
   - IAM roles and policies (least privilege)
   - EC2 instance profile for AWS service access
   - SSH key-based authentication
   - No hardcoded secrets in code or containers

## Performance Optimizations

### Frontend

1. **Build Optimization**
   - Vite for fast builds
   - Code splitting
   - Tree shaking
   - Asset minification

2. **Runtime Optimization**
   - Lazy loading routes
   - Image optimization
   - Gzip compression (Nginx)
   - Browser caching

### Backend

1. **Database**
   - Connection pooling (max 20)
   - Indexed queries
   - Efficient query design

2. **API**
   - Async/await for non-blocking I/O
   - Minimal middleware
   - Response compression

3. **Caching** (Future)
   - Redis for article cache
   - TTL-based invalidation
   - Reduce database queries

## Monitoring & Observability

### Current Implementation

1. **CloudWatch Integration**
   - Container logs shipped to CloudWatch Logs
   - Log group: `/assitech/docker`
   - CodeBuild logs: `/aws/codebuild/assitech-blog-build`
   - RDS logs: PostgreSQL logs exported

2. **Health Checks**
   - Docker healthcheck endpoints
   - /health endpoint for backend
   - Container restart on failure
   - RDS automated health monitoring

3. **Logging**
   - Application logs in CloudWatch
   - Docker logs aggregation
   - Request/response logging
   - Database query logs

### Monitoring Capabilities

1. **CloudWatch Metrics**
   - EC2: CPU, Network, Disk I/O
   - RDS: Connections, CPU, Storage, IOPS
   - Custom application metrics (future)

2. **CloudWatch Dashboards**
   - View all metrics in one place
   - Real-time monitoring
   - Historical data analysis

### Future Enhancements

1. **Alerting**
   - CloudWatch Alarms for critical metrics
   - Error rate alerts
   - Performance degradation notifications
   - Resource utilization warnings
   - SNS notifications

2. **Distributed Tracing**
   - AWS X-Ray integration
   - Request correlation IDs
   - API performance tracking
   - Database query analysis

## Disaster Recovery

### Backup Strategy

1. **RDS Automated Backups**
   - Daily automated backups (7-day retention)
   - Preferred backup window: 03:00-04:00 UTC
   - Point-in-time recovery available
   - Manual snapshots for long-term retention
   - Cross-region backup replication (future)

2. **Code & Infrastructure Backups**
   - Git repository (GitHub) - source of truth
   - ECR image retention (lifecycle policy: last 10 images)
   - CDK infrastructure code in version control
   - All configuration in `.env` files

3. **Secrets Backup**
   - Secrets Manager automatic rotation
   - Manual export for disaster recovery
   - Documented in secure location

### Recovery Procedures

1. **Container Failure** (Automatic)
   - Docker restart policy: `unless-stopped`
   - Health check monitoring
   - Automatic container restart
   - No manual intervention needed

2. **Database Failure**
   - RDS automatic failover (if Multi-AZ enabled)
   - Restore from automated backup
   - Point-in-time recovery to specific timestamp
   - Maximum data loss: 5 minutes

3. **EC2 Instance Failure**
   - Terminate failed instance
   - Redeploy compute stack: `npx cdk deploy assitech-compute-prod`
   - User data script auto-configures new instance
   - Application restored in ~5-10 minutes

4. **Complete Region Failure**
   - Deploy CDK stacks to different region
   - Restore database from cross-region snapshot
   - Update DNS to point to new region
   - Recovery time: ~30-60 minutes

5. **Complete Infrastructure Loss**
   - Clone GitHub repository
   - Run CDK deployment: `npm run deploy`
   - Restore RDS from backup snapshot
   - Total recovery time: ~15-20 minutes

## Development Workflow

### Local Development

```
1. Clone repository
    ↓
2. Configure .env file in project root
   (Required for docker-compose: HuggingFace API key, DB credentials, JWT secret)
    ↓
3. Start services: docker-compose up --build
    ↓
4. Access: http://localhost (frontend), http://localhost:3000 (backend)
    ↓
5. Login with default admin credentials from .env
    ↓
6. Make code changes (hot reload enabled)
    ↓
7. Test locally
    ↓
8. Commit and push to GitHub
```

### AWS Deployment Workflow

**Initial Setup** (One-time):
```
1. Configure infra/.env with AWS credentials and settings
    ↓
2. Bootstrap CDK: npx cdk bootstrap
    ↓
3. Deploy infrastructure: npm run deploy
    ↓
4. Wait ~10-15 minutes for all stacks to create
    ↓
5. Access application at provided URL
```

**Code Updates** (Ongoing):
```
1. Make code changes and push to GitHub
    ↓
2. CodeBuild automatically triggered via webhook
    ↓
3. Monitor build: AWS Console → CodeBuild
    ↓
4. Wait for build completion (~5-10 minutes)
    ↓
5. SSH to EC2: ssh -i keypair.pem ec2-user@instance-ip
    ↓
6. Run update script: /opt/assitech/update.sh
    ↓
7. Verify deployment: curl http://localhost/health
    ↓
8. Monitor logs: docker logs -f assitech-backend
```

**Infrastructure Updates**:
```
1. Modify CDK code in infra/lib/
    ↓
2. Preview changes: npm run diff
    ↓
3. Deploy updates: npm run deploy
    ↓
4. CDK applies only changed resources
```

## Configuration Management

### Environment-Specific Configuration

**Development** (Local):
- **Root `.env`**: Used by docker-compose for container environment variables
  - Database credentials (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
  - API keys (HUGGINGFACE_API_KEY, UNSPLASH_ACCESS_KEY)
  - JWT secret (JWT_SECRET)
  - Admin user credentials (ADMIN_EMAIL, ADMIN_PASSWORD)
- Local PostgreSQL via Docker container
- Debug logging enabled
- CORS from localhost

**Production** (AWS):
- **`infra/.env`**: Used by AWS CDK for infrastructure deployment
  - AWS account/region configuration
  - EC2 instance type and key pair
  - GitHub integration for CodeBuild
  - RDS configuration
  - Application secrets (stored in Secrets Manager)
- RDS PostgreSQL (managed service)
- Production logging
- Secrets from AWS Secrets Manager
- Environment variables injected via EC2 user data script

### Configuration Files

| File | Purpose | Location | Used For |
|------|---------|----------|----------|
| .env | Docker Compose environment variables | Root (/) | **Local development only** |
| .env.example | Template for root .env | Root (/) | Reference/documentation |
| buildspec.yml | CodeBuild build specification | infra/ | AWS CodeBuild |
| cdk.json | CDK app configuration | infra/ | AWS CDK |
| docker-compose.yml | Local container orchestration | Root (/) | Local development |
| infra/.env | AWS CDK deployment configuration | infra/ | **AWS deployment only** |
| infra/.env.example | Template for infra .env | infra/ | Reference/documentation |
| nginx.conf | Nginx web server config | frontend/ | Both local & AWS |
| tsconfig.json | TypeScript config for CDK | infra/ | AWS CDK |
| vite.config.js | Frontend build config | frontend/ | Both local & AWS |

**Important Notes**:
- The **root `.env` file** is **only** for local development with docker-compose
- It is **NOT** used in AWS deployment
- AWS uses `infra/.env` for CDK infrastructure deployment
- AWS uses Secrets Manager for runtime application secrets

## Testing Strategy

### Current Testing

1. **Manual Testing**
   - API endpoint testing (curl)
   - UI functionality testing
   - Docker container testing

2. **Health Checks**
   - Container health endpoints
   - Database connectivity
   - API availability

### Future Testing

1. **Unit Tests**
   - Model layer tests
   - API route tests
   - Component tests

2. **Integration Tests**
   - End-to-end API tests
   - Database integration tests
   - UI integration tests

3. **Load Testing**
   - API performance testing
   - Database query optimization
   - Concurrent user simulation

## Conclusion

This architecture provides a solid foundation for a production-grade auto-generated blog platform deployed on AWS. The Infrastructure as Code approach using AWS CDK ensures:

- **Reproducibility**: Entire infrastructure defined in code
- **Cost Optimization**: ~$0.80/month with 100% free tier optimization
- **Security**: Best practices with Secrets Manager, encryption, and security groups
- **Scalability**: Easy to scale horizontally and vertically
- **Maintainability**: Clear separation of concerns and modular design
- **Automation**: CI/CD pipeline with GitHub → CodeBuild → ECR → EC2
- **Reliability**: Automated backups, health checks, and disaster recovery

The modular design allows for easy maintenance, scaling, and future enhancements while keeping costs minimal through free-tier services and efficient resource utilization.
