#!/bin/bash

# Local launcher for the emergency dispatch system.
# This ensures that when you press Ctrl+C, it completely stops all services.
trap 'kill 0' SIGINT

echo "========================================="
echo "🚨 STARTING EMERGENCY DISPATCH SYSTEM 🚨"
echo "========================================="

# ── 1. Start Python Fire Detection AI Service (Port 5001) ──
echo ""
echo "🔥 1. Starting Fire Detection AI Service (Port 5001)..."
cd fire-detection

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
  echo "   📦 Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt --quiet 2>/dev/null
python3 app.py &
FIRE_PID=$!
sleep 2
cd ..

# ── 2. Start Java Spring Boot Backend (Port 8080) ──
echo ""
echo "🚀 2. Starting Java Spring Boot Backend (Port 8080)..."
cd backend
./gradlew bootRun &
# Give the backend a few seconds to begin compiling before starting the frontend
sleep 4
cd ..

# ── 3. Start React Frontend (Port 5173) ──
echo ""
echo "🚀 3. Starting 3D React Frontend (Port 5173)..."
cd frontend
npm run dev
