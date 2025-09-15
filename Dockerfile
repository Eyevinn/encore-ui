# Encore UI - Runtime Build Dockerfile
# This Dockerfile builds the app at runtime with provided environment variables

FROM node:20-alpine

# Install serve globally for serving the built app
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install all dependencies (needed for build)
RUN npm ci --ignore-scripts && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Make the entrypoint script executable and ensure proper permissions
RUN chmod +x /app/entrypoint.sh && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose default port (can be overridden at runtime)
EXPOSE 3000

# Health check (uses PORT environment variable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Set environment variables with defaults
ENV VITE_ENCORE_API_URL=http://localhost:8080
ENV PORT=3000
ENV NODE_ENV=production

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]