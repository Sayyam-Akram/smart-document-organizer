# Smart Document Organizer - Combined Docker Image
# Builds React frontend and runs Python backend

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend + serve frontend
FROM python:3.10-slim

WORKDIR /app

# Install nginx for serving frontend
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy and install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend to nginx
COPY --from=frontend-build /frontend/build /var/www/html

# Copy nginx config - use conf.d for cleaner setup
COPY nginx-combined.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config that might conflict
RUN rm -f /etc/nginx/sites-enabled/default

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port 80 (single port for everything)
EXPOSE 80

# Start both services
CMD ["./start.sh"]
