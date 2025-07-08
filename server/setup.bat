@echo off
echo 🚀 Setting up Codemate on Windows...

REM Step 1: Install Node.js dependencies
echo 📦 Installing Node.js packages...
call npm install

REM Step 2: Build Docker images
echo 🐳 Building Docker images...

docker build -t c-runner ./language-runners/c_executor
docker build -t cpp-runner ./language-runners/cpp_executor
docker build -t java-runner ./language-runners/java_executor
docker build -t python-runner ./language-runners/python_executor

echo ✅ Setup complete!
echo 🔧 You can now run: node index.js
pause
