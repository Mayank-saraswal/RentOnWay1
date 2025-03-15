@echo off
echo ===================================================
echo       STARTING RENTONWAY FRONTEND SERVER
echo ===================================================

echo.
echo Starting Frontend Server...
cd frontend
start cmd /k "npm run dev"

echo.
echo Frontend started at http://localhost:3000
echo Press any key to exit...
pause > nul 