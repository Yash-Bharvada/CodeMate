#!/bin/bash

echo "🚀 Setting up Codemate on Unix-based system..."

# Step 1: Install Node.js dependencies
echo "📦 Installing Node.js packages..."
npm install

# Step 2: Build Docker images
echo "🐳 Building Docker images..."

docker build -t c-runner ./c_executor
docker build -t cpp-runner ./cpp_executor
docker build -t java-runner ./java_executor
docker build -t python-runner ./python_executor

echo "✅ Setup complete!"
echo "🔧 You can now run: node index.js"
