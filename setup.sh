#!/bin/bash

# Wallet Service Setup Script
# This script sets up the database and runs the application

set -e

echo "🚀 Setting up Internal Wallet Service..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the configuration if needed."
fi

# Build and start services
echo "🐳 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up (healthy)"; then
    echo "✅ Services are running and healthy!"
else
    echo "❌ Services are not healthy. Check logs with: docker-compose logs"
    exit 1
fi

# Test the API
echo "🧪 Testing API endpoints..."
echo "Testing health check..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "Testing wallet API..."
if curl -f http://localhost:3000/api/wallet/health > /dev/null 2>&1; then
    echo "✅ Wallet API is accessible!"
else
    echo "❌ Wallet API is not accessible!"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "  - Main Service: http://localhost:3000"
echo "  - Health Check: http://localhost:3000/health"
echo "  - Wallet API: http://localhost:3000/api/wallet"
echo ""
echo "🗄️  Database:"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo "  - Database: wallet_service"
echo "  - User: wallet_user"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo ""
echo "🔧 API Examples:"
echo "  - Get balance: curl 'http://localhost:3000/api/wallet/balance?userId=user_001&assetTypeId=1'"
echo "  - Get assets: curl 'http://localhost:3000/api/wallet/assets'"
echo "  - Get user wallets: curl 'http://localhost:3000/api/wallet/wallets/user_001'"
echo ""
