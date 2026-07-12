#!/bin/bash

# Cognify-AI Environment Setup Script
# This script helps set up the .env file for the backend

echo "🚀 Setting up Cognify-AI Backend Environment"
echo "=============================================="
echo ""

# Check if .env already exists
if [ -f "backend/.env" ]; then
    echo "⚠️  backend/.env already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy the example file
cp backend/.env.example backend/.env
echo "✅ Created backend/.env from example file"

echo ""
echo "📝 Please edit backend/.env with your configuration:"
echo "   - Set DATABASE_URL if using PostgreSQL"
echo "   - Set JWT_SECRET and REFRESH_TOKEN_SECRET for production"
echo "   - Add AI provider API keys (GEMINI_API_KEY, etc.)"
echo "   - Adjust CORS_ORIGIN if needed"
echo ""
echo "For development, you can use the defaults with mock provider."
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env with your settings"
echo "  2. Run: pnpm dev"
echo ""
