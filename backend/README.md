# AssiTech Blog - Backend

Auto-generated blog backend with AI integration using Node.js, Express, and PostgreSQL.

## Features

- REST API for blog articles (CRUD operations)
- AI-powered article generation using HuggingFace Inference API
- Article cover images via Unsplash API
- JWT-based authentication with role-based access control
- Automated daily article creation with node-cron
- PostgreSQL database with connection pooling
- Docker support for containerized deployment

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 16+
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **AI Integration**: HuggingFace Inference API
- **Image API**: Unsplash API
- **Scheduling**: node-cron

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js               # JWT authentication & authorization
│   ├── models/
│   │   ├── Article.js            # Article data model
│   │   └── User.js               # User data model
│   ├── routes/
│   │   ├── admin.js              # Admin-only endpoints (reseed)
│   │   ├── articles.js           # Article CRUD & generation
│   │   └── auth.js               # Authentication endpoints
│   ├── services/
│   │   ├── aiClient.js           # HuggingFace API integration
│   │   ├── articleJob.js         # Cron job scheduler
│   │   └── unsplashClient.js     # Unsplash image API
│   ├── utils/
│   │   ├── initDb.js             # Database initialization
│   │   └── reseedDb.js           # Database reseeding utility
│   └── index.js                  # Express application entry point
├── Dockerfile
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- HuggingFace API key (free at [huggingface.co](https://huggingface.co/settings/tokens))
- Unsplash API key (optional, free at [unsplash.com/developers](https://unsplash.com/developers))

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpassword
POSTGRES_DB=blogdb

# HuggingFace API (required for AI generation)
HUGGINGFACE_API_KEY=hf_your_key_here
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct

# Unsplash API (optional - for article images)
UNSPLASH_ACCESS_KEY=your_unsplash_key_here

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key

# Admin User (for initial setup)
ADMIN_EMAIL=admin@assitech.challenge
ADMIN_PASSWORD=admin123

# Cron Schedule (default: daily at 2 AM)
ARTICLE_GENERATION_CRON=0 2 * * *
```

4. Initialize database:
```bash
npm run init-db
```

5. Start server:
```bash
npm start
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with watch mode (auto-restart) |
| `npm run init-db` | Initialize database tables and seed data |
| `npm run reseed-db` | Clear and reseed database with new articles |

## API Endpoints

### Health Check

#### GET /health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### GET /api/auth/me
Get current user info (requires authentication)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
}
```

### Articles (Public)

#### GET /api/articles
Get all articles

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "content": "...",
      "summary": "...",
      "image_url": "https://images.unsplash.com/...",
      "author": "AI Writer",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/articles/:id
Get single article by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Article Title",
    "content": "Full article content in markdown...",
    "summary": "Brief summary of the article",
    "image_url": "https://images.unsplash.com/...",
    "author": "AI Writer",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Articles (Admin Only)

All admin endpoints require:
- **Headers:** `Authorization: Bearer <token>`
- **User role:** `admin`

#### POST /api/articles
Create new article manually

**Request Body:**
```json
{
  "title": "My Article Title",
  "content": "Article content in markdown...",
  "summary": "Brief summary",
  "image_url": "https://example.com/image.jpg",
  "author": "John Doe"
}
```

#### PUT /api/articles/:id
Update existing article

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "summary": "Updated summary"
}
```

#### DELETE /api/articles/:id
Delete article

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

#### POST /api/articles/generate
Generate new article with AI on specific topic

**Request Body:**
```json
{
  "topic": "Kubernetes Best Practices"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "Kubernetes Best Practices for Production",
    "content": "AI-generated content...",
    "summary": "AI-generated summary...",
    "image_url": "https://images.unsplash.com/...",
    "author": "AI Writer"
  },
  "message": "Article generated successfully"
}
```

#### POST /api/articles/generate-random
Generate new article with AI on random topic

**Response:** Same as `/generate`

#### GET /api/articles/topics
Get AI-generated topic suggestions

**Query Parameters:** `count` (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    "Cloud-Native Architecture Best Practices",
    "Microservices vs Monoliths",
    "Container Security in Production"
  ]
}
```

### Admin

#### POST /api/admin/reseed
Reseed database with new AI-generated articles

**Response:**
```json
{
  "success": true,
  "message": "Database reseeded successfully with 3 new articles",
  "data": {
    "deletedCount": 5,
    "createdCount": 3,
    "articles": [
      { "id": 6, "title": "New Article 1" },
      { "id": 7, "title": "New Article 2" },
      { "id": 8, "title": "New Article 3" }
    ]
  }
}
```

## External API Integrations

### HuggingFace Inference API

Used for AI-powered article generation.

- **Model**: `microsoft/Phi-3-mini-4k-instruct` (configurable)
- **Endpoint**: HuggingFace Inference API
- **Features**:
  - Generate full articles with title, content, and summary
  - Generate topic suggestions
  - Automatic retry with fallback topics

**Get API Key**: https://huggingface.co/settings/tokens

### Unsplash API

Used for fetching relevant cover images for articles.

- **Features**:
  - Keyword extraction from article titles
  - Intelligent query mapping (e.g., "docker" → container images)
  - In-memory caching to reduce API calls
  - Graceful fallback (articles work without images)

**Get API Key**: https://unsplash.com/developers

## Database Schema

### Articles Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(255) | Article title |
| content | TEXT | Full article content (markdown) |
| summary | TEXT | Brief summary |
| image_url | TEXT | Cover image URL (from Unsplash) |
| author | VARCHAR(100) | Author name (default: "AI Writer") |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(255) | Unique email |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| role | VARCHAR(20) | User role (user/admin) |
| created_at | TIMESTAMP | Registration timestamp |

## Docker

Build image:
```bash
docker build -t assitech-blog-backend .
```

Run container:
```bash
docker run -p 3000:3000 --env-file .env assitech-blog-backend
```

## Scheduled Jobs

The application automatically generates one new article daily at 2 AM (configurable via `ARTICLE_GENERATION_CRON` environment variable).

**Cron Format**: `0 2 * * *` (minute hour day month weekday)

Examples:
- `0 2 * * *` - Daily at 2:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad request (missing required fields)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate email/username)
- `500` - Internal server error

## Development

Run in watch mode (auto-restart on file changes):
```bash
npm run dev
```

Test API endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Get all articles
curl http://localhost:3000/api/articles

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@assitech.challenge","password":"admin123"}'

# Generate article (with token)
curl -X POST http://localhost:3000/api/articles/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"topic":"Docker Security Best Practices"}'
```
