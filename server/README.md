# Encore UI Backend Server

A Node.js/Express proxy server that handles CORS restrictions between the Encore UI frontend and the Encore video encoding API.

## Features

- **CORS Handling**: Properly configured CORS to allow frontend communication
- **API Proxying**: Transparent proxy to Encore API endpoints
- **Authentication**: Bearer token support for Encore API
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Built-in health check endpoint

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   ENCORE_API_URL=http://your-encore-api-url:8080
   
   # Authentication - choose one method:
   # Option 1: Static bearer token
   ENCORE_BEARER_TOKEN=your_bearer_token_here
   
   # Option 2: OSC Dynamic token (recommended for OSC environments)
   # OSC_ACCESS_TOKEN=your_osc_access_token_here
   
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. **Start the server:**
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health and configuration status

### Proxied Encore Endpoints
All requests to `/api/*` are proxied to the Encore API:

- `GET /api/encoreJobs` → `{ENCORE_API_URL}/encoreJobs`
- `POST /api/encoreJobs` → `{ENCORE_API_URL}/encoreJobs`
- `GET /api/encoreJobs/{id}` → `{ENCORE_API_URL}/encoreJobs/{id}`
- `DELETE /api/encoreJobs/{id}` → `{ENCORE_API_URL}/encoreJobs/{id}`
- `POST /api/encoreJobs/{id}/cancel` → `{ENCORE_API_URL}/encoreJobs/{id}/cancel`
- `GET /api/queue` → `{ENCORE_API_URL}/queue`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENCORE_API_URL` | Encore API base URL | `http://localhost:8080` |
| `ENCORE_BEARER_TOKEN` | Static bearer token for Encore API | None |
| `OSC_ACCESS_TOKEN` | OSC access token for dynamic service tokens | None |
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173,http://localhost:3000` |

### Authentication Methods

The server supports two authentication methods (choose one):

1. **Static Bearer Token**: Provide a fixed bearer token via `ENCORE_BEARER_TOKEN`
2. **OSC Dynamic Tokens**: Provide an OSC access token via `OSC_ACCESS_TOKEN` to generate service access tokens on demand

When both are provided, static token takes precedence. OSC dynamic tokens are recommended for OSC environments as they handle token rotation automatically.

### CORS Configuration

The server is configured to allow:
- Credentials (cookies, authorization headers)
- Common HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- Standard headers (Content-Type, Authorization, X-Requested-With)

## Development

The server includes logging for all proxied requests and errors. Check the console output for debugging information.

### Testing the Server

1. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **API Proxy:**
   ```bash
   curl http://localhost:3001/api/encoreJobs
   ```

## Frontend Integration

Update your frontend environment variables to point to the backend server:

```env
VITE_ENCORE_API_URL=http://localhost:3001/api
# Remove VITE_ENCORE_BEARER_TOKEN as it's now handled by the backend
```