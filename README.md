# Encore UI

A beautiful and modern React-based user interface for the [Encore video encoding API](https://eyevinn.github.io/encore-api-docs/). This application provides an intuitive way to manage video encoding jobs, monitor queue status, and track encoding progress in real-time.

![Screenshot](screenshot.png)

## Features

✨ **Modern UI/UX**
- Clean, responsive design built with React and Tailwind CSS
- Dark/Light theme toggle
- Intuitive navigation with sidebar layout
- Real-time updates and progress tracking

🎬 **Video Encoding Management**
- Create new encoding jobs with comprehensive form validation
- Support for multiple input files and encoding profiles
- Monitor job progress with live updates
- View detailed job information and logs
- Cancel running jobs

📊 **Queue Management**
- Real-time queue monitoring
- Priority-based job ordering
- Queue statistics and insights
- Currently processing jobs overview

🚀 **Developer Experience**
- TypeScript for type safety
- React Query for efficient API state management
- Modern build tools with Vite
- Component-based architecture
- Comprehensive error handling

⚙️ **Configuration & Security**
- Configurable API endpoint (runtime or build-time)
- Optional bearer token authentication
- Settings persistence with localStorage
- Connection testing and validation
- Environment variable support

## Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Running Encore API server (default: http://localhost:8080)

## Quick Start

### Option 1: Unified Application (Recommended)

Single server that serves both frontend and API proxy - no CORS issues:

1. **Install all dependencies:**
   ```bash
   npm run setup
   ```

2. **Configure the application:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and set your Encore API URL and bearer token
   ```

3. **Start the unified application:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3001` to access the Encore UI

### Option 2: Development Mode

For development with hot-reload (frontend and backend run separately):

1. **Install dependencies:**
   ```bash
   npm run setup
   ```

2. **Start development servers:**
   ```bash
   npm run full:dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` to access the Encore UI

### Option 3: Frontend Only

If you prefer to connect directly to the Encore API (may encounter CORS issues):

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set VITE_ENCORE_API_URL to your Encore API
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to access the Encore UI

## Configuration

### Unified Application Configuration (Recommended)

When using the unified application, configure the backend server to proxy requests to your Encore API:

1. **Configure backend environment:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit `server/.env`:**
   ```env
   ENCORE_API_URL=http://your-encore-server:8080
   
   # Authentication - choose one method:
   # Option 1: Static bearer token
   ENCORE_BEARER_TOKEN=your-auth-token-here
   
   # Option 2: OSC Dynamic token (recommended for OSC environments)
   # OSC_ACCESS_TOKEN=your-osc-access-token-here
   
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. **Frontend automatically uses relative paths** (`/api`) when served from the unified server

### Direct API Connection (Alternative)

If you're not using the backend proxy, you can configure the frontend to connect directly:

**Option 1: Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and set your API URL and optional bearer token
VITE_ENCORE_API_URL=http://your-encore-server:8080
VITE_ENCORE_BEARER_TOKEN=your-auth-token-here
```

**Option 2: Runtime Configuration**
- Navigate to the Settings page in the application
- Enter your Encore API URL and optional bearer token
- Test the connection and save your settings
- Settings are persisted in browser localStorage

### Authentication

The application supports multiple authentication methods:

#### Backend Authentication (Recommended)
When using the unified backend server, authentication is handled server-side with two options:

- **Static Bearer Token**: Provide a fixed token via `ENCORE_BEARER_TOKEN` environment variable
- **OSC Dynamic Tokens**: Provide an OSC access token via `OSC_ACCESS_TOKEN` for automatic service token generation
- **Token Rotation**: OSC tokens are generated fresh for each request, handling automatic rotation
- **Security**: Tokens are never exposed to the frontend when using the backend proxy

#### Frontend Authentication (Direct API Connection)
When connecting directly to the Encore API:

- **Bearer Token**: Add an optional bearer token for API authentication
- **Secure Storage**: Tokens are stored securely in browser localStorage
- **Runtime Configuration**: Tokens can be set through the Settings page or environment variables
- **Automatic Headers**: When configured, the token is automatically included as `Authorization: Bearer <token>` in all API requests

**Option 3: Build-time Configuration**
Set the environment variables when building:
```bash
VITE_ENCORE_API_URL=http://production-server:8080 VITE_ENCORE_BEARER_TOKEN=token npm run build
```

## Docker Deployment

The application is deployed as a single unified container that serves both frontend and backend:

### Docker Build & Run

**Build the image:**
```bash
docker build -t encore-ui .
```

**Run with default configuration:**
```bash
docker run -p 3001:3001 encore-ui
```

**Run with custom configuration:**
```bash
# Using static bearer token
docker run -p 3001:3001 \
  -e ENCORE_API_URL=http://your-encore-server:8080 \
  -e ENCORE_BEARER_TOKEN=your-token-here \
  encore-ui

# Using OSC dynamic tokens
docker run -p 3001:3001 \
  -e ENCORE_API_URL=http://your-encore-server:8080 \
  -e OSC_ACCESS_TOKEN=your-osc-token-here \
  encore-ui
```

**Run on different port:**
```bash
docker run -p 8080:3001 \
  -e PORT=3001 \
  -e ENCORE_API_URL=http://your-encore-server:8080 \
  encore-ui
```

### Docker Compose

**Using docker-compose.yml:**
```bash
# Set environment variables (optional)
export ENCORE_API_URL=http://your-encore-server:8080
export ENCORE_BEARER_TOKEN=your-token-here
# OR
export OSC_ACCESS_TOKEN=your-osc-token-here

# Start the application
docker-compose up -d
```

**Using .env file with Docker Compose:**
```bash
# Create a .env file with static token
echo "ENCORE_API_URL=http://your-encore-server:8080" > .env
echo "ENCORE_BEARER_TOKEN=your-token-here" >> .env

# OR create with OSC token
echo "ENCORE_API_URL=http://your-encore-server:8080" > .env
echo "OSC_ACCESS_TOKEN=your-osc-token-here" >> .env

# Start with docker-compose
docker-compose up -d
```

### Quick Deployment Script

Use the provided deployment script for easy setup:

```bash
# Make script executable (first time only)
chmod +x docker-deploy.sh

# Deploy with defaults
./docker-deploy.sh

# Deploy with custom configuration
./docker-deploy.sh -u http://your-server:8080 -t your-token

# Deploy on different port  
./docker-deploy.sh -p 8080

# Deploy with custom container port
./docker-deploy.sh -p 8080 --container-port 8080

# View help
./docker-deploy.sh --help

# Stop deployment
./docker-deploy.sh --stop
```

### Key Features

- **Runtime Configuration**: Environment variables are applied during container startup
- **Fresh Builds**: The app is built inside the container with the provided configuration
- **Health Checks**: Built-in health monitoring for production deployments
- **Security**: Runs as non-root user for enhanced security
- **Configurable Port**: Application port can be customized via PORT environment variable (default: 3000)

## Technology Stack

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About Eyevinn Technology

We are Eyevinn Technology, and we help companies in the TV, media, and entertainment sectors optimize costs and boost profitability through enhanced media solutions. We are independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward, we develop proof-of-concepts and tools. We share things we have learn and code as open-source.
