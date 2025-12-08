# AssiTech Blog Challenge - Project TODO

## Project Overview
Full-stack auto-generated blog application with AWS deployment using React, Node.js, PostgreSQL, Docker, and AWS services.

## Technology Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI**: HuggingFace Inference API (Free)
- **Scheduling**: node-cron
- **Deployment**: Docker + AWS (EC2, ECR, CodeBuild)

---

## Phase 1: Backend Development
- [ ] Initialize Node.js project structure
  - [ ] Create backend directory and package.json
  - [ ] Install dependencies (express, pg, node-cron, dotenv, etc.)
  - [ ] Setup folder structure (src, routes, services, models)

- [ ] Database Setup
  - [ ] Create PostgreSQL schema/models
  - [ ] Setup database connection
  - [ ] Create database initialization script
  - [ ] Add seed data (3+ articles)

- [ ] API Development
  - [ ] Create GET /api/articles endpoint (list all)
  - [ ] Create GET /api/articles/:id endpoint (single article)
  - [ ] Create POST /api/articles endpoint (create article)
  - [ ] Add health check endpoint

- [ ] AI Integration
  - [ ] Setup HuggingFace API client
  - [ ] Create article generation service
  - [ ] Test AI text generation

- [ ] Scheduling
  - [ ] Implement node-cron job for daily article generation
  - [ ] Add logging for scheduled tasks

- [ ] Backend Docker
  - [ ] Create Dockerfile
  - [ ] Test Docker build locally

---

## Phase 2: Frontend Development
- [ ] Initialize React + Vite project
  - [ ] Create frontend directory
  - [ ] Setup Vite + React
  - [ ] Install dependencies (react-router-dom, axios, etc.)

- [ ] Components & Pages
  - [ ] Create article list page
  - [ ] Create article detail page
  - [ ] Create basic layout/navigation
  - [ ] Add loading and error states

- [ ] API Integration
  - [ ] Create API client service
  - [ ] Connect to backend endpoints
  - [ ] Handle API responses

- [ ] Styling
  - [ ] Add responsive design
  - [ ] Basic styling (CSS/Tailwind)

- [ ] Frontend Docker
  - [ ] Create Dockerfile
  - [ ] Test Docker build locally

---

## Phase 3: Local Integration
- [ ] Docker Compose
  - [ ] Create docker-compose.yml
  - [ ] Configure services (frontend, backend, postgres)
  - [ ] Setup networking between containers
  - [ ] Test full stack locally

- [ ] Environment Configuration
  - [ ] Create .env.example files
  - [ ] Document environment variables
  - [ ] Setup different configs for dev/prod

---

## Phase 4: AWS Infrastructure
- [ ] AWS ECR Setup
  - [ ] Create ECR repositories (frontend, backend)
  - [ ] Document repository URIs

- [ ] AWS CodeBuild
  - [ ] Create buildspec.yml
  - [ ] Configure build project
  - [ ] Test image builds and pushes to ECR

- [ ] AWS EC2 Setup
  - [ ] Launch EC2 instance (free tier)
  - [ ] Install Docker on EC2
  - [ ] Configure security groups (ports 80, 443, SSH)
  - [ ] Setup PostgreSQL on EC2 or use container

- [ ] Deployment Scripts
  - [ ] Create init-ec2.sh script
  - [ ] Create deploy.sh script
  - [ ] Test deployment process

---

## Phase 5: Documentation & Final Steps
- [ ] Documentation
  - [ ] Create comprehensive README.md
  - [ ] Create ARCHITECTURE.md
  - [ ] Add setup instructions for local development
  - [ ] Document deployment process
  - [ ] Add API documentation

- [ ] Testing & Verification
  - [ ] Verify daily article generation works
  - [ ] Test all API endpoints
  - [ ] Verify frontend displays articles correctly
  - [ ] Check responsive design
  - [ ] Monitor EC2 deployment

- [ ] Final Checklist
  - [ ] Ensure 3+ articles are pre-seeded
  - [ ] Verify daily cron job is running
  - [ ] Test live URL
  - [ ] Review code quality
  - [ ] Push final code to GitHub

---

## Phase 6: Submission
- [ ] Prepare Video (30-120 seconds)
  - [ ] Introduction
  - [ ] Demo of application
  - [ ] Technical decisions explanation
  - [ ] Future improvements discussion

- [ ] Submit to hiring@assimetria.com
  - [ ] Live URL
  - [ ] GitHub repository link
  - [ ] Video link
  - [ ] Subject: [Tech Challenge] - <Your Name>

---

## Notes & Decisions
- Using HuggingFace Inference API (free tier) for AI text generation
- Using node-cron for scheduling (self-contained)
- PostgreSQL for production-ready database
- Vite for modern, fast frontend builds
- Targeting AWS free tier resources

## Future Improvements (to mention in video)
- Add authentication/admin panel
- Implement article editing/deletion
- Add categories/tags
- Improve AI prompts for better content
- Add CI/CD automation
- Implement caching (Redis)
- Add monitoring and logging (CloudWatch)
- SSL/HTTPS setup with Let's Encrypt
- Database backups
- Load balancing for scaling
