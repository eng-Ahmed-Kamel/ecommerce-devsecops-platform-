# ============================================================
# Stage 1: Build Angular App
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source code
COPY . .

# Build for production (budgets fixed in angular.json)
RUN npm run build -- --configuration=production

# ============================================================
# Stage 2: Serve with Nginx (production-grade)
# ============================================================
FROM nginx:alpine

# Install security updates
RUN apk upgrade --no-cache

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
# Angular 17+ outputs to dist/<project-name>/browser/
COPY --from=build /app/dist/angular-course/browser /usr/share/nginx/html

# Security: Run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html &&     chmod -R 755 /usr/share/nginx/html &&     chown -R nginx:nginx /var/cache/nginx &&     chown -R nginx:nginx /var/log/nginx &&     chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid &&     chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3     CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]