# ============================================
# Multi-Stage Dockerfile for Node E-Commerce Backend
# Optimized for: ES Modules ("type": "module"), bcrypt, mongoose
# ============================================

# ============================================
# STAGE 1: Dependencies + Native Build
# ============================================
FROM node:20-alpine AS builder

# Install build tools for native modules (bcrypt requires compilation)
RUN apk add --no-cache     python3     make     g++     linux-headers

WORKDIR /app

# Copy dependency files first (better Docker layer caching)
COPY package*.json ./

# Install production dependencies only
# bcrypt v6.0.0 needs compilation, so we need build tools
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# ============================================
# STAGE 2: Production Runtime
# ============================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling (PID 1)
RUN apk add --no-cache dumb-init

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs &&     adduser -S nodejs -u 1001

WORKDIR /app

# Copy ONLY production dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check endpoint (adjust if your app has a different health route)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3     CMD node -e "import('http').then(m => m.default.get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)))" || exit 1

# Use dumb-init to handle signals properly (prevents zombie processes)
ENTRYPOINT ["dumb-init", "--"]

# Start the application (ES module entry point)
CMD ["node", "index.js"]
