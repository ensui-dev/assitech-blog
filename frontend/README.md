# AssiTech Blog - Frontend

React + Vite frontend for the AI-generated blog application with admin dashboard.

## Features

- Modern React 18 with Vite build system
- JWT-based authentication with protected routes
- Admin dashboard with full article management
- AI-powered article generation interface
- Database management tools
- Article list and detail views with cover images
- Responsive design for mobile and desktop
- Docker support with Nginx for production

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Production Server**: Nginx

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js              # Axios API client with auth interceptor
│   ├── components/
│   │   ├── ArticleCard.jsx        # Article preview card component
│   │   ├── ErrorMessage.jsx       # Error display component
│   │   ├── Header.jsx             # Navigation header
│   │   ├── Loading.jsx            # Loading spinner component
│   │   └── ProtectedRoute.jsx     # Route guard for auth/admin
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication state provider
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── ArticleEditor.jsx      # Create/edit article form
│   │   │   ├── ArticleGenerator.jsx   # AI article generation UI
│   │   │   ├── ArticleManagement.jsx  # Article list & CRUD
│   │   │   └── DatabaseManager.jsx    # Database reseed tools
│   │   ├── AdminDashboard.jsx     # Admin layout with nav
│   │   ├── ArticleDetail.jsx      # Single article view
│   │   ├── Home.jsx               # Public article list
│   │   └── Login.jsx              # Login page
│   ├── styles/
│   │   └── App.css                # Global styles
│   ├── App.jsx                    # Main app with routing
│   └── main.jsx                   # Entry point
├── nginx.conf                     # Production nginx config
├── Dockerfile
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```bash
# Backend API URL (defaults to http://localhost:3000)
VITE_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Article list with cards |
| `/article/:id` | ArticleDetail | Full article view |
| `/login` | Login | Admin login page |

### Admin Routes (Protected)

All admin routes require authentication with admin role.

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | ArticleManagement | Article list with edit/delete |
| `/admin/generate` | ArticleGenerator | AI article generation |
| `/admin/create` | ArticleEditor | Create new article form |
| `/admin/edit/:id` | ArticleEditor | Edit existing article |
| `/admin/database` | DatabaseManager | Reseed database |

## Components

### Core Components

#### Header
- Navigation bar with logo and links
- Shows "Admin" link when logged in as admin
- Responsive design

#### ArticleCard
- Displays article preview with image, title, summary
- Click to navigate to full article
- Shows formatted date

#### ProtectedRoute
- Wraps admin routes
- Redirects to login if not authenticated
- Checks for admin role when `requireAdmin` prop is set

### Page Components

#### Home
- Fetches and displays all articles
- Shows loading state and error handling
- Responsive grid layout

#### ArticleDetail
- Displays full article content
- Shows cover image, title, author, date
- Markdown-formatted content

#### Login
- Email/password form
- Redirects to admin dashboard on success
- Shows error messages

#### AdminDashboard
- Layout wrapper for admin pages
- Navigation sidebar with links
- User info and logout button

#### ArticleManagement
- Lists all articles in table format
- Edit and delete buttons
- Links to create/generate pages

#### ArticleGenerator
- Select topic from suggestions or enter custom
- Generate article with AI
- Shows loading state during generation

#### ArticleEditor
- Create or edit article form
- Fields: title, content, summary, image URL, author
- Markdown textarea for content

#### DatabaseManager
- Reseed database button
- Clears all articles and generates new ones
- Shows confirmation and results

## API Integration

The frontend communicates with the backend via the API client (`src/api/client.js`).

### Authentication API

```javascript
import { authApi } from './api/client';

// Login
const { data } = await authApi.login(email, password);
// Returns: { user, token }

// Register
const { data } = await authApi.register(username, email, password);
// Returns: { user, token }

// Get current user
const { data } = await authApi.me();
// Returns: { user }
```

### Articles API

```javascript
import { articlesApi } from './api/client';

// Get all articles
const { data } = await articlesApi.getAll();

// Get single article
const { data } = await articlesApi.getById(id);

// Create article (admin)
const { data } = await articlesApi.create({ title, content, summary, image_url });

// Update article (admin)
const { data } = await articlesApi.update(id, { title, content });

// Delete article (admin)
await articlesApi.delete(id);

// Generate article with AI (admin)
const { data } = await articlesApi.generate(topic);

// Generate random article (admin)
const { data } = await articlesApi.generateRandom();

// Get topic suggestions (admin)
const { data } = await articlesApi.getTopicSuggestions(count);
```

## Authentication

The app uses JWT-based authentication managed by `AuthContext`.

### AuthContext

Provides:
- `user` - Current user object or null
- `token` - JWT token or null
- `loading` - Initial auth check in progress
- `login(email, password)` - Login function
- `logout()` - Logout function
- `isAdmin()` - Check if user has admin role
- `isAuthenticated` - Boolean auth status

### Usage

```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <div>Welcome, {user.username}!</div>;
}
```

### Token Storage

- Tokens are stored in `localStorage`
- Automatically attached to API requests via Axios interceptor
- Cleared on logout

## Build

Build for production:
```bash
npm run build
```

Output is placed in `dist/` directory.

Preview production build:
```bash
npm run preview
```

## Docker

Build image:
```bash
docker build -t assitech-blog-frontend .
```

Run container:
```bash
docker run -p 80:80 assitech-blog-frontend
```

### Production Configuration

The Docker image uses Nginx to:
- Serve static files from the Vite build
- Proxy `/api` requests to the backend
- Handle SPA routing (all routes serve `index.html`)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

Note: In Docker/production, the Nginx config proxies `/api` to the backend container, so `VITE_API_URL` is not needed.

## Development

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. If admin-only, wrap with `ProtectedRoute`

### Adding a New Component

1. Create component in `src/components/`
2. Export and import where needed
3. Add styles to `src/styles/App.css`

### API Integration

1. Add method to `src/api/client.js`
2. Call from component using async/await
3. Handle loading and error states

## Styling

Styles are in `src/styles/App.css` using standard CSS:
- Mobile-first responsive design
- CSS variables for theming (colors, spacing)
- BEM-like class naming
- Grid and Flexbox layouts

## Default Credentials

For development/testing:
- **Email**: `admin@assitech.challenge`
- **Password**: `admin123`

(Configure via backend environment variables)
