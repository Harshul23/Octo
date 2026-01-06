#!/bin/bash

# GitHub Authentication Setup Script
# This script helps you quickly set up the GitHub OAuth authentication

echo "🚀 GitHub Authentication Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your GITHUB_CLIENT_ID"
else
    echo "✅ Frontend .env file already exists"
fi

# Check if server/.env exists
if [ ! -f server/.env ]; then
    echo "📝 Creating backend .env file..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env file"
    echo "⚠️  Please edit server/.env and add your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET"
else
    echo "✅ Backend .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a GitHub OAuth App at https://github.com/settings/developers"
echo "2. Edit .env and add your GITHUB_CLIENT_ID"
echo "3. Edit server/.env and add both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET"
echo "4. Run 'npm run dev:server' in one terminal"
echo "5. Run 'npm run dev' in another terminal"
echo ""
echo "📖 For detailed instructions, see INSTRUCTIONS.md"
