@echo off
REM Expense Tracker - Quick Setup Script for Windows

echo.
echo ========================================
echo Expense Tracker - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing backend dependencies...
echo.

cd backend
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Run this command:
echo    npm start
echo.
echo 2. Open your browser to:
echo    http://localhost:5000
echo.
echo For more details, see QUICKSTART.md
echo.
pause
