@echo off
echo ===================================================
echo       STARTING RENTONWAY PROJECT SERVICES
echo ===================================================

echo.
echo [1/4] Checking if MongoDB is running...
call check-mongodb.bat
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] MongoDB connection check failed.
    echo The application may not work correctly without a database connection.
    echo.
    echo Press any key to continue anyway or CTRL+C to abort...
    pause > nul
)

echo.
echo [2/4] Checking backend dependencies...
cd backend
call npm list --depth=0 > nul 2>&1
if %errorlevel% neq 0 (
    echo Some dependencies may be missing. Running npm install...
    call npm install
) else (
    echo Backend dependencies are installed.
)
cd ..

echo.
echo [3/4] Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo.
echo Waiting for backend to initialize (15 seconds)...
echo This ensures the API is ready before starting the frontend.
timeout /t 15 /nobreak > nul

echo.
echo [4/4] Starting Frontend Development Server...
cd frontend
call npm list --depth=0 > nul 2>&1
if %errorlevel% neq 0 (
    echo Some dependencies may be missing. Running npm install...
    call npm install
) else (
    echo Frontend dependencies are installed.
)
cd ..
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo       RENTONWAY SERVICES STARTED SUCCESSFULLY
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