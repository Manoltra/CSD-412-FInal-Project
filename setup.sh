#!/bin/bash

# Expense Tracker - Quick Setup Script for Linux/Mac

echo ""
echo "========================================"
echo "Expense Tracker - Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please download and install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "Node.js found:"
node --version

echo ""
echo "Installing backend dependencies..."
echo ""

cd backend
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: npm install failed"
    echo "Please check your internet connection and try again"
    exit 1
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Run this command:"
echo "   npm start"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:5000"
echo ""
echo "For more details, see QUICKSTART.md"
echo ""
