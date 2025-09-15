#!/bin/bash

# Encore UI Docker Build and Deploy Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="encore-ui"
CONTAINER_NAME="encore-ui"
HOST_PORT="3000"
CONTAINER_PORT="3000"
API_URL=""
BEARER_TOKEN=""

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to show usage
show_help() {
    echo "Encore UI Docker Deployment Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -u, --api-url URL        Encore API URL (default: http://localhost:8080)"
    echo "  -t, --token TOKEN        Bearer token for authentication"
    echo "  -p, --port PORT          Host port to bind to (default: 3000)"
    echo "  --container-port PORT    Container port (default: 3000)"
    echo "  -n, --name NAME          Container name (default: encore-ui)"
    echo "  --build-only            Only build the image, don't run"
    echo "  --stop                  Stop and remove existing container"
    echo "  -h, --help              Show this help message"
    echo
    echo "Examples:"
    echo "  $0                                           # Run with defaults"
    echo "  $0 -u http://api.example.com:8080           # Custom API URL"
    echo "  $0 -u http://api.example.com:8080 -t token  # With authentication"
    echo "  $0 --stop                                   # Stop existing container"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--api-url)
            API_URL="$2"
            shift 2
            ;;
        -t|--token)
            BEARER_TOKEN="$2"
            shift 2
            ;;
        -p|--port)
            HOST_PORT="$2"
            shift 2
            ;;
        --container-port)
            CONTAINER_PORT="$2"
            shift 2
            ;;
        -n|--name)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --stop)
            STOP_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Stop existing container if requested
if [[ "${STOP_ONLY}" == "true" ]]; then
    print_info "Stopping and removing container: ${CONTAINER_NAME}"
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    print_success "Container stopped and removed"
    exit 0
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Build the Docker image
print_info "Building Docker image: ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" .
print_success "Docker image built successfully"

# Exit if build-only mode
if [[ "${BUILD_ONLY}" == "true" ]]; then
    print_success "Build completed. Image: ${IMAGE_NAME}"
    exit 0
fi

# Stop and remove existing container if it exists
print_info "Checking for existing container: ${CONTAINER_NAME}"
if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    print_warning "Stopping and removing existing container"
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
fi

# Prepare environment variables
ENV_VARS="-e PORT=${CONTAINER_PORT}"
if [[ -n "${API_URL}" ]]; then
    ENV_VARS="${ENV_VARS} -e VITE_ENCORE_API_URL=${API_URL}"
fi
if [[ -n "${BEARER_TOKEN}" ]]; then
    ENV_VARS="${ENV_VARS} -e VITE_ENCORE_BEARER_TOKEN=${BEARER_TOKEN}"
fi

# Run the container
print_info "Starting container: ${CONTAINER_NAME}"
docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${HOST_PORT}:${CONTAINER_PORT}" \
    ${ENV_VARS} \
    --restart unless-stopped \
    "${IMAGE_NAME}"

print_success "Container started successfully!"
print_info "Application will be available at: http://localhost:${HOST_PORT}"
print_info "Container name: ${CONTAINER_NAME}"

# Show configuration
echo
print_info "Configuration:"
echo "  API URL: ${API_URL:-http://localhost:8080 (default)}"
echo "  Bearer Token: ${BEARER_TOKEN:+[CONFIGURED]}"
echo "  Host Port: ${HOST_PORT}"
echo "  Container Port: ${CONTAINER_PORT}"
echo
print_info "To check logs: docker logs ${CONTAINER_NAME}"
print_info "To stop: docker stop ${CONTAINER_NAME}"
print_info "To stop and remove: $0 --stop"