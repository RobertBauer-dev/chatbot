#!/bin/bash

echo "🚀 Building Conversational AI Platform..."

# Build API Gateway
echo "📦 Building API Gateway..."
cd api-gateway
mvn clean package -DskipTests
cd ..

# Build Session Service
echo "📦 Building Session Service..."
cd session-service
mvn clean package -DskipTests
cd ..

# Build Frontend
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
echo "🐳 Starting services with Docker Compose..."
docker-compose up --build
