# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY client/ ./

# Build the application with environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
RUN npm run build

# Verify SVG files are copied
RUN ls -la dist/ && echo "SVG files in dist:" && ls -la dist/*.svg || echo "No SVG files found"

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files in production container
RUN ls -la /usr/share/nginx/html/ && echo "SVG files in nginx:" && ls -la /usr/share/nginx/html/*.svg || echo "No SVG files found in nginx"

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 