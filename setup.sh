#!/bin/bash

echo "🚀 Setting up Doni Logistics Platform"
echo "======================================"

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

echo "✅ Frontend setup complete"

# Go back to root
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open the project in IntelliJ IDEA"
echo "2. Install Jmix plugin if not already installed"
echo "3. Run DonilogisticsApplication.java to start the backend"
echo "4. In another terminal, run 'cd frontend && npm start' to start the frontend"
echo ""
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "Username: admin"
echo "Password: admin"
