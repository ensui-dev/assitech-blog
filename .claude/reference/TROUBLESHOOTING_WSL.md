# Troubleshooting: Docker on WSL

## Issue: "permission denied while trying to connect to the Docker daemon socket"

This happens when running Docker from WSL (Windows Subsystem for Linux).

## Solutions

### Option 1: Use Docker Desktop for Windows (Recommended)

1. **Install Docker Desktop for Windows** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and restart your computer

2. **Enable WSL Integration in Docker Desktop**
   - Open Docker Desktop
   - Go to Settings → Resources → WSL Integration
   - Enable "Enable integration with my default WSL distro"
   - Enable integration for your WSL distro (Ubuntu, etc.)
   - Click "Apply & Restart"

3. **Verify Docker is running**
   ```bash
   docker --version
   docker ps
   ```

4. **Try docker-compose again**
   ```bash
   docker-compose up --build
   ```

### Option 2: Use sudo (Quick Fix)

If Docker Desktop integration isn't working, use sudo:

```bash
sudo docker-compose up --build
```

**Note**: You may need to create .env with sudo as well:
```bash
sudo cp .env.example .env
sudo nano .env
# Add your HuggingFace API key
```

### Option 3: Add User to Docker Group (Linux/WSL)

```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker

# Verify
docker ps

# Try again
docker-compose up --build
```

## Fix the .env File Issue

You also need to set up your environment variables:

```bash
# Copy the example file
cp .env.example .env

# Edit the file
nano .env
# or
vim .env
# or on Windows side:
# notepad.exe .env
```

Add your HuggingFace API key:
```env
HUGGINGFACE_API_KEY=hf_your_actual_api_key_here
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpassword
POSTGRES_DB=blogdb
```

**Get HuggingFace API Key**:
1. Go to https://huggingface.co/settings/tokens
2. Create new token
3. Copy it (starts with `hf_...`)

## Fix docker-compose.yml Version Warning

The warning about `version` is harmless, but you can remove it if you want:

```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Remove the first line:
# version: '3.8'
```

Or I can do this for you.

## Complete Setup Steps

**Step 1**: Set up environment
```bash
cp .env.example .env
nano .env
# Add your HuggingFace API key
```

**Step 2**: Ensure Docker is running
```bash
# Check if Docker Desktop is running (Windows)
# Open Docker Desktop application

# Or start Docker service (native Linux)
sudo service docker start
```

**Step 3**: Run with appropriate permissions
```bash
# Option A: If Docker Desktop WSL integration is enabled
docker-compose up --build

# Option B: If using sudo
sudo docker-compose up --build

# Option C: Run in detached mode
docker-compose up -d --build
```

## Quick Test

After fixing Docker access, test with:

```bash
# Test Docker works
docker run hello-world

# If that works, try the application
docker-compose up --build
```

## Alternative: Run on Windows PowerShell

If WSL Docker integration is problematic, you can run directly from Windows PowerShell:

```powershell
# In Windows PowerShell (not WSL)
cd C:\Users\ensui\Documents\AssiTech

# Copy env file
Copy-Item .env.example .env

# Edit .env
notepad .env
# Add your HuggingFace API key

# Run docker-compose
docker-compose up --build
```

## Need More Help?

If none of these work:

1. **Restart Docker Desktop** completely
2. **Restart WSL**: `wsl --shutdown` (in Windows PowerShell), then reopen WSL
3. **Check Docker Desktop is running** - Look for whale icon in Windows system tray
4. **Verify WSL version**: `wsl -l -v` (should be WSL 2)

## Once Docker is Working

You should see:
```
✔ Container assitech-postgres   Created
✔ Container assitech-backend    Created
✔ Container assitech-frontend   Created
Attaching to assitech-backend, assitech-frontend, assitech-postgres
```

Then access:
- Frontend: http://localhost
- Backend: http://localhost:3000
- API: http://localhost:3000/api/articles
