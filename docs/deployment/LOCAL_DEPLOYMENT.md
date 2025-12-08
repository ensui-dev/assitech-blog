# AssiTech - Local Deployment Guide

Complete guide for deploying AssiTech locally using Docker Compose for development and testing.

## Overview

Local deployment uses Docker Compose to run the application stack:
- **Frontend**: React application served via Nginx (port 80)
- **Backend**: Node.js/Express API server (port 3000)
- **PostgreSQL**: Database with persistent volume storage (port 5432)

External services (optional):
- **HuggingFace API**: AI-powered article generation
- **Unsplash API**: Article cover images

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git
- Node.js 18+ (for local development without Docker)
- A text editor

### Install Docker

**Windows:**
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Run installer and follow prompts
3. Enable WSL 2 backend if prompted
4. Restart your computer

**macOS:**
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Drag to Applications folder
3. Launch and follow setup

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Log out and back in for group changes
```

### Verify Installation

```bash
docker --version
docker compose version
```

## Quick Start (4 Steps)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/assitech.git
cd assitech
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values (optional for basic functionality)
nano .env  # or use any text editor
```

Minimum configuration for local development:
```bash
# JWT Secret (required for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin credentials (for first login)
ADMIN_EMAIL=admin@assitech.challenge
ADMIN_PASSWORD=admin123
```

### 3. Start Application

```bash
docker compose up -d
```

This command:
- Builds frontend and backend Docker images
- Starts PostgreSQL database
- Starts backend API server
- Starts frontend web server
- Sets up networking between containers

### 4. Access Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | Main application |
| Admin Login | http://localhost/login | Admin dashboard |
| Backend API | http://localhost:3000 | REST API |
| Health Check | http://localhost:3000/health | API health endpoint |

**Default Admin Credentials:**
- Email: `admin@assitech.challenge`
- Password: `admin123`

## Detailed Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# ===========================================
# HuggingFace API (Optional - for AI articles)
# ===========================================
# Get your free API key at: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_your_api_key_here

# ===========================================
# Unsplash API (Optional - for article images)
# ===========================================
# Get your free API key at: https://unsplash.com/developers
# If not provided, articles will be created without images
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# ===========================================
# Database Configuration
# ===========================================
# These match docker-compose.yml defaults - change if needed
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpassword
POSTGRES_DB=blogdb

# ===========================================
# JWT Configuration (Required)
# ===========================================
# Use a strong secret in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ===========================================
# Admin User (for initial setup)
# ===========================================
ADMIN_EMAIL=admin@assitech.challenge
ADMIN_PASSWORD=admin123
```

### Getting API Keys

#### HuggingFace API (for AI article generation)

1. Create account at [huggingface.co](https://huggingface.co)
2. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Name: `assitech` (or anything)
5. Role: `Read`
6. Copy the token starting with `hf_`

#### Unsplash API (for article images)

1. Create account at [unsplash.com](https://unsplash.com/join)
2. Go to [Unsplash Developers](https://unsplash.com/developers)
3. Click "Your apps" > "New Application"
4. Accept terms and create app
5. Copy "Access Key"

## Docker Compose Commands

### Start Services

```bash
# Start all services in background
docker compose up -d

# Start and rebuild images
docker compose up -d --build

# Start with logs visible
docker compose up
```

### Stop Services

```bash
# Stop all services (keeps data)
docker compose stop

# Stop and remove containers (keeps data)
docker compose down

# Stop and remove everything including volumes (DELETES DATA)
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 backend
```

### Manage Containers

```bash
# Check status
docker compose ps

# Restart a service
docker compose restart backend

# Rebuild and restart a service
docker compose up -d --build backend

# Execute command in container
docker compose exec backend npm run migrate
docker compose exec postgres psql -U bloguser -d blogdb
```

## Database Management

### Access PostgreSQL CLI

```bash
docker compose exec postgres psql -U bloguser -d blogdb
```

### Common Database Commands

```sql
-- List all tables
\dt

-- View articles
SELECT id, title, created_at FROM articles ORDER BY created_at DESC LIMIT 10;

-- Count articles
SELECT COUNT(*) FROM articles;

-- View users
SELECT email, role FROM users;

-- Exit
\q
```

### Reset Database

```bash
# Stop services and remove volumes
docker compose down -v

# Start fresh
docker compose up -d
```

### Backup Database

```bash
# Export database to file
docker compose exec postgres pg_dump -U bloguser blogdb > backup.sql

# Restore from backup
cat backup.sql | docker compose exec -T postgres psql -U bloguser -d blogdb
```

## Development Workflow

### Making Code Changes

**Frontend changes:**
```bash
# Rebuild and restart frontend only
docker compose up -d --build frontend
```

**Backend changes:**
```bash
# Rebuild and restart backend only
docker compose up -d --build backend
```

### Running Without Docker

For faster development iteration:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Note: You'll still need PostgreSQL running (via Docker or locally).

### Hot Reload Setup

For development with hot reload, modify `docker-compose.yml`:

```yaml
backend:
  # ... existing config ...
  volumes:
    - ./backend:/app
    - /app/node_modules
  command: npm run dev
```

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

**Common issues:**
- Port already in use: Stop other services on ports 80, 3000, or 5432
- Out of disk space: Run `docker system prune`

### Port Already in Use

```bash
# Find what's using the port (Windows PowerShell)
netstat -ano | findstr :80

# Find what's using the port (Linux/Mac)
lsof -i :80

# Use different ports - modify docker-compose.yml:
ports:
  - "8080:80"  # Access at localhost:8080 instead
```

### Database Connection Failed

```bash
# Check if postgres is healthy
docker compose ps

# Restart postgres
docker compose restart postgres

# Check postgres logs
docker compose logs postgres
```

### Build Failures

```bash
# Clear Docker cache and rebuild
docker compose build --no-cache

# Remove all containers and volumes
docker compose down -v
docker system prune -a

# Start fresh
docker compose up -d --build
```

### Frontend Shows Blank Page

```bash
# Check frontend logs
docker compose logs frontend

# Verify nginx is serving
docker compose exec frontend cat /etc/nginx/nginx.conf

# Check if backend is reachable from frontend
docker compose exec frontend wget -qO- http://backend:3000/health
```

### Backend API Errors

```bash
# Check backend logs
docker compose logs -f backend

# Verify database connection
docker compose exec backend npm run migrate

# Check environment variables
docker compose exec backend env | grep -E "(POSTGRES|JWT|HUGGING)"
```

### WSL 2 Issues (Windows)

If using WSL 2 backend on Windows:

1. Ensure WSL 2 is installed:
   ```powershell
   wsl --install
   ```

2. Set Docker to use WSL 2:
   - Docker Desktop > Settings > General > Use WSL 2 based engine

3. For file permission issues:
   ```bash
   # Run from WSL terminal, not PowerShell
   wsl
   cd /mnt/c/path/to/assitech
   docker compose up -d
   ```

## Health Checks

### Verify All Services

```bash
# Check container status
docker compose ps

# Expected output:
# NAME                 STATUS
# assitech-frontend    running (healthy)
# assitech-backend     running (healthy)
# assitech-postgres    running (healthy)
```

### API Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Database Health Check

```bash
docker compose exec postgres pg_isready -U bloguser -d blogdb
```

Expected: `/var/run/postgresql:5432 - accepting connections`

## Resource Requirements

### Minimum System Requirements

- **RAM**: 4 GB (8 GB recommended)
- **Disk**: 5 GB free space
- **CPU**: 2 cores

### Docker Resource Allocation

If containers are slow, increase Docker resources:

**Docker Desktop (Windows/Mac):**
- Settings > Resources
- Memory: 4 GB minimum
- CPUs: 2 minimum
- Disk: 20 GB minimum

## Architecture Reference

```
┌──────────────────────────────────────────────────────┐
│              Docker Compose (Local)                  │
│                                                      │
│  ┌────────────┐     ┌────────────┐                   │
│  │  Frontend  │     │  Backend   │                   │
│  │  (Nginx)   │────>│  (Node.js) │                   │
│  │  Port 80   │     │ Port 3000  │                   │
│  └────────────┘     └─────┬──────┘                   │
│                           │                          │
│                     ┌─────▼──────┐                   │
│                     │ PostgreSQL │                   │
│                     │  Port 5432 │                   │
│                     └────────────┘                   │
└──────────────────────────────────────────────────────┘
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

## Next Steps

After successful local deployment:

1. **Login** to admin dashboard at http://localhost/login
2. **Generate test articles** using the AI generation feature (requires HuggingFace API key)
3. **Explore the API** at http://localhost:3000
4. **Make code changes** and rebuild with `docker compose up -d --build`
5. **Deploy to AWS** using the [AWS Deployment Guide](./AWS_DEPLOYMENT.md)

## Support and Resources

- **Project README**: [README.md](../../README.md)
- **Architecture Documentation**: [docs/ARCHITECTURE.md](../ARCHITECTURE.md)
- **AWS Deployment**: [docs/deployment/AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
- **Docker Compose Reference**: https://docs.docker.com/compose/
