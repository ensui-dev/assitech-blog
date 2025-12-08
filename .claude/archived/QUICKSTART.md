# Quick Start Guide

Get the AssiTech Blog running in 5 minutes!

## Prerequisites Checklist

- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] HuggingFace account created (free at https://huggingface.co)
- [ ] HuggingFace API token generated (https://huggingface.co/settings/tokens)

## Local Development (5 Minutes)

### Step 1: Get Your HuggingFace API Key

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name (e.g., "AssiTech Blog")
4. Select "Read" permission
5. Copy the token (starts with `hf_...`)

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and paste your HuggingFace API key
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

Your `.env` should look like:
```env
HUGGINGFACE_API_KEY=hf_YourActualTokenHere
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpassword
POSTGRES_DB=blogdb
```

### Step 3: Start the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Step 4: Access the Application

**Frontend**: http://localhost

**Backend API**: http://localhost:3000

**Health Check**: http://localhost:3000/health

### Step 5: Test Article Generation

```bash
# Manually trigger article generation (optional)
curl -X POST http://localhost:3000/api/articles

# View all articles
curl http://localhost:3000/api/articles
```

## First Run Behavior

The application will:
1. Create PostgreSQL database
2. Create articles table
3. Seed 3 initial articles
4. Start cron job for daily article generation
5. Serve frontend on port 80

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Status
```bash
docker-compose ps
```

### Stop Application
```bash
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Access Database
```bash
docker-compose exec postgres psql -U bloguser -d blogdb

# Then run SQL commands:
# SELECT * FROM articles;
# \q to exit
```

## Troubleshooting

### Port Already in Use

If port 80 or 3000 is already in use:

**Option 1**: Stop the conflicting service

**Option 2**: Change ports in `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change to 8080

backend:
  ports:
    - "3001:3000"  # Change to 3001
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - HuggingFace API key not set
# - Database connection failed
# - Port conflict
```

### Database Connection Failed

```bash
# Wait for PostgreSQL to be ready (takes ~10 seconds)
docker-compose logs postgres

# Should see: "database system is ready to accept connections"
```

### Frontend Shows "Failed to Fetch"

```bash
# Check backend is running
curl http://localhost:3000/health

# Restart backend if needed
docker-compose restart backend
```

## Development Workflow

### Making Changes

**Backend Changes**:
```bash
# Edit files in backend/src/
# Restart backend
docker-compose restart backend
```

**Frontend Changes**:
```bash
# For development with hot reload:
cd frontend
npm install
npm run dev

# Access at http://localhost:5173
```

### Testing Article Generation

```bash
# Generate article immediately (don't wait for cron)
curl -X POST http://localhost:3000/api/articles

# Check the result
curl http://localhost:3000/api/articles | json_pp
```

### Reset Database

```bash
# Stop everything
docker-compose down -v

# Restart (will recreate database)
docker-compose up --build
```

## Next Steps

1. **Customize Topics**: Edit `backend/src/services/aiClient.js` to change article topics
2. **Adjust Styling**: Modify `frontend/src/styles/App.css`
3. **Change Schedule**: Update `ARTICLE_GENERATION_CRON` in `.env`
4. **Deploy to AWS**: Follow [README.md](README.md) AWS Deployment section

## AWS Deployment (Quick Version)

### Prerequisites
- AWS Account
- AWS CLI configured
- EC2 instance running

### Steps

1. **SSH into EC2**:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Download and run init script**:
   ```bash
   curl -O https://raw.githubusercontent.com/your-repo/main/infra/scripts/init-ec2.sh
   chmod +x init-ec2.sh
   sudo ./init-ec2.sh
   ```

3. **Configure environment**:
   ```bash
   sudo nano /opt/assitech-blog/.env
   # Add your HuggingFace API key
   ```

4. **Deploy**:
   ```bash
   cd /opt/assitech-blog
   ./deploy.sh
   ```

5. **Access**:
   - Open http://your-ec2-public-ip in browser

## Getting Help

- Check [README.md](README.md) for detailed documentation
- Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- Check Docker logs for errors
- Verify all environment variables are set

## Success Checklist

- [ ] Docker containers running (`docker-compose ps`)
- [ ] Health check returns success (`curl http://localhost:3000/health`)
- [ ] Frontend loads in browser (http://localhost)
- [ ] 3 articles displayed on homepage
- [ ] Can view article details
- [ ] Backend logs show no errors

**Congratulations! Your AssiTech Blog is running!** 🎉
