# Encore UI

A beautiful and modern React-based user interface for the [Encore video encoding API](https://eyevinn.github.io/encore-api-docs/). This application provides an intuitive way to manage video encoding jobs, monitor queue status, and track encoding progress in real-time.

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

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` to access the Encore UI

## Configuration

### API Server Configuration

The application connects to the Encore API at `http://localhost:8080` by default. You can configure the API URL in several ways:

**Option 1: Environment Variables (Recommended)**
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

The application supports optional bearer token authentication:

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

The application can be deployed using Docker with runtime environment configuration:

### Docker Build & Run

**Build the image:**
```bash
docker build -t encore-ui .
```

**Run with default configuration:**
```bash
docker run -p 3000:3000 encore-ui
```

**Run with custom configuration:**
```bash
docker run -p 3000:3000 \
  -e VITE_ENCORE_API_URL=http://your-encore-server:8080 \
  -e VITE_ENCORE_BEARER_TOKEN=your-token-here \
  encore-ui
```

**Run on different port:**
```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e VITE_ENCORE_API_URL=http://your-encore-server:8080 \
  encore-ui
```

### Docker Compose

**Using docker-compose.yml:**
```bash
# Set environment variables (optional)
export VITE_ENCORE_API_URL=http://your-encore-server:8080
export VITE_ENCORE_BEARER_TOKEN=your-token-here

# Start the application
docker-compose up -d
```

**Using .env file with Docker Compose:**
```bash
# Create a .env file
echo "VITE_ENCORE_API_URL=http://your-encore-server:8080" > .env
echo "VITE_ENCORE_BEARER_TOKEN=your-token-here" >> .env

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
