#!/bin/bash

# Docker Build Script for Nutrition Book Reader Club
# This script builds the Docker image with required environment variables

set -e  # Exit on error

echo "🐳 Building Docker image for Nutrition Book Reader Club..."
echo ""

# Load environment variables from .env.local
if [ -f .env.local ]; then
    echo "✅ Loading environment variables from .env.local"
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Check if required variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY not set in .env.local"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Build the Docker image
echo "🔨 Building Docker image..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t nutrition-book-reader:latest \
  .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker image built successfully!"
    echo ""
    echo "📦 Image: nutrition-book-reader:latest"
    echo ""
    echo "🚀 To run the container, use:"
    echo "   docker run -d --name nutrition-app -p 3000:3000 --env-file .env.local nutrition-book-reader:latest"
    echo ""
else
    echo ""
    echo "❌ Docker build failed!"
    exit 1
fi


