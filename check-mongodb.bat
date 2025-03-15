@echo off
echo ===================================================
echo       CHECKING MONGODB CONNECTION
echo ===================================================

echo.
echo Attempting to connect to MongoDB...

:: Try to connect to MongoDB using mongosh
mongosh --eval "db.runCommand({ping:1})" --quiet > nul 2>&1

:: Check if the connection was successful
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] MongoDB is running and accessible.
    echo.
    exit /b 0
) else (
    echo.
    echo [ERROR] Could not connect to MongoDB.
    echo.
    echo Please make sure MongoDB is installed and running:
    echo 1. If using MongoDB locally, start MongoDB service
    echo 2. If using MongoDB Atlas, check your internet connection
    echo    and verify the connection string in backend/.env
    echo.
    echo MongoDB URI in your .env file:
    findstr "MONGODB_URI" backend\.env
    echo.
    echo ===================================================
    echo.
    exit /b 1
) 