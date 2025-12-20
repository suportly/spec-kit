#!/bin/bash

# Setup script for pre-commit hooks
# This script installs and configures pre-commit hooks for the project

set -e

echo "🔧 Setting up pre-commit hooks for spec-kit..."

# Check if we're in the right directory
if [ ! -f ".pre-commit-config.yaml" ]; then
    echo "❌ Error: .pre-commit-config.yaml not found. Are you in the project root?"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python installation
if ! command_exists python3; then
    echo "❌ Error: Python 3 is required but not installed."
    exit 1
fi

# Check Node.js installation
if ! command_exists node; then
    echo "❌ Error: Node.js is required but not installed."
    exit 1
fi

# Check npm installation
if ! command_exists npm; then
    echo "❌ Error: npm is required but not installed."
    exit 1
fi

# Install pre-commit if not already installed
if ! command_exists pre-commit; then
    echo "📦 Installing pre-commit..."
    pip3 install pre-commit
else
    echo "✅ pre-commit is already installed"
fi

# Install pre-commit hooks
echo "🔗 Installing pre-commit hooks..."
pre-commit install

# Install commit-msg hook for conventional commits
echo "📝 Installing commit-msg hook..."
pre-commit install --hook-type commit-msg

# Setup frontend dependencies if frontend directory exists
if [ -d "frontend" ]; then
    echo "📦 Setting up frontend dependencies..."
    cd frontend
    if [ -f "package.json" ]; then
        npm install
    else
        echo "⚠️  Warning: No package.json found in frontend directory"
    fi
    cd ..
fi

# Setup backend dependencies if backend directory exists
if [ -d "backend" ]; then
    echo "🐍 Setting up backend dependencies..."
    cd backend
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
    elif [ -f "pyproject.toml" ]; then
        pip3 install -e .
    else
        echo "⚠️  Warning: No requirements.txt or pyproject.toml found in backend directory"
    fi
    
    # Install development dependencies
    pip3 install black isort flake8 mypy pytest
    cd ..
fi

# Run pre-commit on all files to test setup
echo "🧪 Testing pre-commit setup..."
if pre-commit run --all-files; then
    echo "✅ Pre-commit hooks setup completed successfully!"
else
    echo "⚠️  Pre-commit hooks installed but some checks failed."
    echo "   This is normal for initial setup. Fix the issues and commit again."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Pre-commit hooks are now active and will run automatically on each commit."
echo "To manually run all hooks: pre-commit run --all-files"
echo "To update hooks: pre-commit autoupdate"
echo "To skip hooks (not recommended): git commit --no-verify"
echo ""
echo "Happy coding! 🚀"