#!/bin/sh
set -e

# Set default values for environment variables
export ENCORE_API_URL=${ENCORE_API_URL:-http://localhost:8080}
export ENCORE_BEARER_TOKEN=${ENCORE_BEARER_TOKEN:-}
export OSC_ACCESS_TOKEN=${OSC_ACCESS_TOKEN:-}
export PORT=${PORT:-3001}
export NODE_ENV=${NODE_ENV:-production}

echo "🚀 Starting Encore UI Unified Application"
echo "📡 Encore API URL: ${ENCORE_API_URL}"

# Authentication method logging
if [ -n "${ENCORE_BEARER_TOKEN}" ]; then
  echo "🔒 Authentication: Static bearer token configured"
elif [ -n "${OSC_ACCESS_TOKEN}" ]; then
  echo "🔑 Authentication: OSC dynamic token generation enabled"
else
  echo "⚠️  Authentication: No authentication configured"
fi

echo "🌐 Server Port: ${PORT}"
echo "🏗️  Environment: ${NODE_ENV}"
echo ""

# Check if frontend build exists, build if not
if [ ! -d "dist" ]; then
    echo "📦 Frontend build not found, building application..."
    npm run build
    echo "✅ Build complete!"
    echo ""
fi

# Start the unified Express server
echo "🌐 Starting unified server..."
exec npm run server:start