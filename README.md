# Music Hits

A web application that visualizes and compares Spotify track data with YouTube statistics, deployed on Cloudflare Workers with global CDN acceleration.

## Features

- 🎵 **Spotify Integration**: Browse tracks and artists with real-time Spotify API data
- 📊 **Data Visualization**: Compare Spotify popularity with YouTube metrics
- 🔍 **Smart Search**: Fast client-side search powered by Fuse.js
- 🎨 **Modern UI**: React + TailwindCSS responsive interface
- ⚡ **Edge Computing**: Deployed on Cloudflare Workers for global performance
- 🔒 **Secure API**: Server-side Spotify API proxy keeps credentials safe

## Tech Stack

### Frontend

- **React 19** - UI framework
- **Redux Toolkit** - State management
- **TailwindCSS 4** - Styling
- **Recharts** - Data visualization
- **Fuse.js** - Client-side search
- **Vite** - Build tool

### Backend

- **Cloudflare Workers** - Edge runtime
- **Hono** - Fast web framework for Workers
- **Workers Assets** - Static file serving with SPA routing

## Live Demo

🚀 **Production**: [https://music-hits.andrewck24.workers.dev](https://music-hits.andrewck24.workers.dev)

## Local Development

### Prerequisites

- **Node.js** 18 or higher
- **Spotify API Credentials** (get from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard))

### Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Spotify API credentials** (for Worker):

   ```bash
   # Copy the example file
   cp .dev.vars.example .dev.vars

   # Edit .dev.vars and fill in your credentials:
   # SPOTIFY_CLIENT_ID=your_client_id_here
   # SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

4. **Configure frontend environment variables**:

   ⚠️ **Required**: The project does NOT commit `.env.development` or `.env.production` to git.

   ```bash
   # Create environment files from the template
   cp .env.example .env.development
   cp .env.example .env.production

   # .env.development should contain:
   # VITE_API_BASE_URL=http://localhost:8787/api/spotify

   # .env.production should contain:
   # VITE_API_BASE_URL=/api/spotify
   ```

5. **(Optional) Override environment variables**:

   If you need to use a different Worker port or configuration:

   ```bash
   # Create .env.local for personal overrides
   echo "VITE_API_BASE_URL=http://localhost:9000/api/spotify" > .env.local
   ```

### Running the Development Server

The application requires **two separate processes** to run locally:

#### Terminal 1: Start the Cloudflare Worker (API server)

```bash
npx wrangler dev
```

This starts the Worker on **port 8787** and provides:

- Spotify API proxy endpoints (`/api/spotify/*`)
- Static file serving (in production mode)

#### Terminal 2: Start the Vite Dev Server (Frontend)

```bash
npm run dev
```

This starts the Vite dev server on **port 5173** with:

- Hot Module Replacement (HMR)
- Fast refresh
- Automatic API proxy to Worker

#### Access the Application

Open your browser and navigate to:

```text
http://localhost:5173
```

The frontend will automatically proxy API requests to the Worker running on port 8787.

### Environment Variables

#### Frontend Environment Variables (Vite)

| Variable            | Description         | Development Default                 | Production Default |
| ------------------- | ------------------- | ----------------------------------- | ------------------ |
| `VITE_API_BASE_URL` | Worker API endpoint | `http://localhost:8787/api/spotify` | `/api/spotify`     |

Configuration files:

- `.env.example` - Template file (committed to git)
- `.env.development` - Development environment (**NOT committed**, must create locally)
- `.env.production` - Production build (**NOT committed**, must create locally)
- `.env.local` - Local overrides (**NOT committed**, optional)

**⚠️ Important**: `.env.development` and `.env.production` are excluded from git for security. Developers must create these files locally using `.env.example` as a template.

#### Worker Environment Variables (Cloudflare)

| Variable                | Description               | Source                                                   |
| ----------------------- | ------------------------- | -------------------------------------------------------- |
| `SPOTIFY_CLIENT_ID`     | Spotify API Client ID     | `.dev.vars` (local) or Cloudflare Dashboard (production) |
| `SPOTIFY_CLIENT_SECRET` | Spotify API Client Secret | `.dev.vars` (local) or Cloudflare Dashboard (production) |

**Important**: Never commit `.dev.vars` to version control. Use `.dev.vars.example` as a template.

## Available Scripts

### Development

- `npm run dev` - Start Vite dev server (frontend only, port 5173)
- `npx wrangler dev` - Start Worker dev server (API + static files, port 8787)

### Build & Deploy

- `npm run build` - Build frontend for production
- `npm run deploy:cf` - Build and deploy to Cloudflare Workers
- `npm run preview` - Preview production build locally

### Testing

- `npm test` - Run unit tests (Vitest)
- `npm run test:ui` - Open Vitest UI
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests (Playwright)
- `npm run test:e2e:ui` - Open Playwright UI

### Code Quality

- `npm run type-check` - TypeScript type checking
- `npm run lint` - ESLint code linting

## Deployment

### Cloudflare Workers Deployment

The application is automatically deployed via **Cloudflare Git Integration**:

1. **Push to `main` branch** → Automatic production deployment
2. **Create Pull Request** → Automatic preview environment

#### Manual Deployment

```bash
# Build and deploy
npm run deploy:cf

# Or step by step:
npm run build
npx wrangler deploy
```

#### Configure Secrets

For production deployment, set your Spotify credentials as Cloudflare Secrets:

```bash
# Via Wrangler CLI
npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_CLIENT_SECRET

# Or via Cloudflare Dashboard:
# Workers & Pages → Your Project → Settings → Environment Variables
```

### Disabling GitHub Pages (if previously used)

If migrating from GitHub Pages:

1. Go to **GitHub repository → Settings → Pages**
2. Select **"Disable GitHub Pages"**

## Project Structure

```text
music-hits/
├── src/                          # Frontend React application
│   ├── app.tsx                   # Main app component
│   ├── components/               # React components
│   ├── features/                 # Redux slices and logic
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API services
│   ├── types/                    # TypeScript types
│   └── vite-env.d.ts            # Vite environment types
├── worker/                       # Cloudflare Worker
│   ├── index.ts                  # Worker entry point (Hono app)
│   ├── spotify/                  # Spotify API integration
│   │   ├── base.ts              # Base API caller
│   │   └── token.ts             # Token management
│   └── types/                    # Worker types
├── public/                       # Static assets
├── tests/                        # Test files
├── wrangler.jsonc               # Cloudflare Workers config
├── vite.config.ts               # Vite configuration
├── .env.development             # Development environment vars
├── .env.production              # Production environment vars
├── .dev.vars.example            # Worker env vars template
└── package.json                 # Dependencies and scripts
```

## Architecture

### Edge Functions Pattern

```text
User Request
    ↓
Cloudflare Workers (Global Edge Network)
    ├─→ /api/spotify/*  → Worker API (Spotify proxy)
    └─→ /*              → Static Assets (React SPA)
```

### Data Flow

```text
Frontend (React)
    ↓ fetch('/api/spotify/artists/:id')
Worker API (Hono)
    ↓ Token management + Auth
Spotify Web API
    ↓ Response
Worker API
    ↓ JSON
Frontend (Redux state update)
    ↓
UI Components (re-render)
```

## Performance

- **LCP**: < 900ms (with Zstandard compression)
- **TTFB**: < 350ms (Cloudflare edge network)
- **CLS**: 0.00 (no layout shift)
- **Global CDN**: 300+ locations worldwide
- **Asset Compression**: Zstandard (zstd)

## Contributing

This project uses:

- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** (via ESLint config) for code formatting

Please ensure all tests pass and types are correct before submitting:

```bash
npm run type-check
npm run lint
npm test
```

## License

[Add your license here]

## Credits

- **Spotify Web API** - Music data
- **YouTube Data** - Video statistics (from local dataset)
- **Cloudflare Workers** - Edge computing platform
