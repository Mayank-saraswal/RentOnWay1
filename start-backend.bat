@echo off
echo ===================================================
echo       STARTING RENTONWAY BACKEND SERVER
echo ===================================================

echo.
echo Starting Backend Server...
cd backend
start cmd /k "npm run dev"

echo.
echo Backend started at http://localhost:5000
echo Press any key to exit...
pause > nul 