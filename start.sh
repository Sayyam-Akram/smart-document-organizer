#!/bin/sh
# Start backend and nginx

# Start the Python backend in the background
echo "Starting backend on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start nginx in the foreground
echo "Starting nginx on port 80..."
nginx -g "daemon off;"
