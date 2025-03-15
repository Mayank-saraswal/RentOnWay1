@echo off
echo ===================================================
echo       STARTING RENTONWAY PROJECT
echo ===================================================

echo.
echo [1/3] Checking MongoDB connection...
call check-mongodb.bat 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] MongoDB connection check failed.
    echo The application may not work correctly without a database connection.
    echo.
    echo Press any key to continue anyway or CTRL+C to abort...
    pause > nul
)

echo.
echo [2/3] Starting Backend Server...
call start-backend.bat

echo.
echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo [3/3] Starting Frontend Server...
call start-frontend.bat

echo.
echo ===================================================
echo       RENTONWAY PROJECT STARTED SUCCESSFULLY
echo ===================================================
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo.
echo * To test the connection, visit: http://localhost:3000
echo * The connection status will be displayed on the home page
echo.
echo Press any key to close this window...
pause > nul 