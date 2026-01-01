@echo off
cd /d "%~dp0"
echo 🚀 Starting Client Automation Platform...
echo.
echo Make sure you have run 'npm install' first!
echo.
node launcher.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error occurred. Press any key to exit.
    pause
)
