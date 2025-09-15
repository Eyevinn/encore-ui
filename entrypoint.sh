#!/bin/sh
set -e

# Set default values for environment variables
export VITE_ENCORE_API_URL=${VITE_ENCORE_API_URL:-http://localhost:8080}
export VITE_ENCORE_BEARER_TOKEN=${VITE_ENCORE_BEARER_TOKEN:-}
export PORT=${PORT:-3000}

echo "🚀 Building Encore UI with configuration:"
echo "📡 VITE_ENCORE_API_URL=${VITE_ENCORE_API_URL}"
echo "🔑 VITE_ENCORE_BEARER_TOKEN=${VITE_ENCORE_BEARER_TOKEN:+[CONFIGURED]}"
echo "🌐 PORT=${PORT}"
echo ""

# Build the application with environment variables
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

echo "✅ Build complete!"
echo ""

# Serve the built application
echo "🌐 Starting server on port ${PORT}..."
exec serve -s dist -l ${PORT} --no-clipboard