# Encore UI - Unified Application Dockerfile
# Single container that builds frontend and runs Express backend serving both API and frontend

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs server/package*.json ./server/

# Install frontend dependencies
RUN npm ci --ignore-scripts && npm cache clean --force

# Install backend dependencies
RUN cd server && npm ci --ignore-scripts && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Make the entrypoint script executable and ensure proper permissions
RUN chmod +x /app/entrypoint.sh && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose default port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

# Set environment variables with defaults for backend
ENV ENCORE_API_URL=http://localhost:8080
ENV PORT=3001
ENV NODE_ENV=production
# Authentication environment variables (optional)
# ENV ENCORE_BEARER_TOKEN=
# ENV OSC_ACCESS_TOKEN=

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]