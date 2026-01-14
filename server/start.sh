#!/bin/bash
# Quick start script for Privy Backend

echo "=================================="
echo "  Privy Backend - Quick Start"
echo "=================================="
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "Please install PostgreSQL first"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✓ PostgreSQL found"
echo "✓ Python 3 found"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🗄️  Setting up database..."
echo "Please ensure PostgreSQL is running and execute:"
echo ""
echo "  psql postgres << EOF"
echo "  CREATE DATABASE privy_db;"
echo "  CREATE USER privy_user WITH PASSWORD 'privy_password';"
echo "  GRANT ALL PRIVILEGES ON DATABASE privy_db TO privy_user;"
echo "  EOF"
echo ""
read -p "Press Enter once database is set up..."

echo ""
echo "🚀 Starting server..."
echo ""
echo "Server will be available at:"
echo "  - API: http://localhost:8000"
echo "  - Docs: http://localhost:8000/docs"
echo ""
echo "Default credentials:"
echo "  - admin/admin123 (admin role)"
echo "  - analyst/analyst123 (analyst role)"
echo "  - external/external123 (external role)"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
