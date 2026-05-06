#!/bin/bash

# Local launcher for the emergency dispatch system.
# This ensures that when you press Ctrl+C, it completely stops both the frontend and backend.
trap 'kill 0' SIGINT

echo "========================================="
echo "🚨 STARTING EMERGENCY DISPATCH SYSTEM 🚨"
echo "========================================="

echo "..."
echo "🚀 1. Starting Java Spring Boot Backend (Port 8080)..."
cd backend
./gradlew bootRun &
# Give the backend a few seconds to begin compiling before starting the frontend
sleep 4 
cd ..

echo "🚀 2. Starting 3D React Frontend (Port 5173)..."
cd frontend
npm run dev
