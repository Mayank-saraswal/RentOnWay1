@echo off
echo ===================================================
echo       RENTONWAY TROUBLESHOOTING UTILITY
echo ===================================================

echo.
echo This utility will help diagnose and fix common issues with the RentOnWay application.
echo.

:MENU
echo Please select an option:
echo 1. Check MongoDB connection
echo 2. Check Backend API status
echo 3. Check Frontend status
echo 4. Fix common issues
echo 5. View logs
echo 6. Exit
echo.

set /p CHOICE=Enter your choice (1-6): 

if "%CHOICE%"=="1" goto CHECK_MONGODB
if "%CHOICE%"=="2" goto CHECK_BACKEND
if "%CHOICE%"=="3" goto CHECK_FRONTEND
if "%CHOICE%"=="4" goto FIX_ISSUES
if "%CHOICE%"=="5" goto VIEW_LOGS
if "%CHOICE%"=="6" goto EXIT

echo Invalid choice. Please try again.
goto MENU

:CHECK_MONGODB
echo.
echo Checking MongoDB connection...
call check-mongodb.bat
echo.
echo Press any key to return to the menu...
pause > nul
goto MENU

:CHECK_BACKEND
echo.
echo Checking Backend API status...
call check-backend.bat
echo.
echo Press any key to return to the menu...
pause > nul
goto MENU

:CHECK_FRONTEND
echo.
echo Checking Frontend status...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [SUCCESS] Frontend is running and accessible.
    echo Response status code: %STATUS%
) else (
    echo [ERROR] Could not connect to Frontend.
    if "%STATUS%"=="" (
        echo No response received. The frontend might not be running.
    ) else (
        echo Response status code: %STATUS%
    )
    echo.
    echo Please check:
    echo 1. Is the frontend server running? (cd frontend ^&^& npm run dev)
    echo 2. Is port 3000 available or is it being used by another application?
)
echo.
echo Press any key to return to the menu...
pause > nul
goto MENU

:FIX_ISSUES
echo.
echo ===================================================
echo       FIXING COMMON ISSUES
echo ===================================================
echo.
echo 1. Checking for missing dependencies...
echo.
echo Checking backend dependencies...
cd backend
call npm list --depth=0 > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing missing backend dependencies...
    call npm install
) else (
    echo Backend dependencies are installed.
)
cd ..

echo.
echo Checking frontend dependencies...
cd frontend
call npm list --depth=0 > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing missing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies are installed.
)
cd ..

echo.
echo 2. Checking for port conflicts...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo Port 5000 is in use. This might cause conflicts with the backend server.
    echo You can either:
    echo - Stop the process using port 5000
    echo - Change the PORT in backend/.env to a different value
) else (
    echo Port 5000 is available for the backend server.
)

netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo Port 3000 is in use. This might cause conflicts with the frontend server.
    echo You can either:
    echo - Stop the process using port 3000
    echo - Change the port in frontend/vite.config.js
) else (
    echo Port 3000 is available for the frontend server.
)

echo.
echo 3. Checking environment files...
if not exist backend\.env (
    echo [WARNING] backend/.env file is missing.
    echo Creating a sample .env file...
    echo # Server Configuration > backend\.env
    echo PORT=5000 >> backend\.env
    echo NODE_ENV=development >> backend\.env
    echo MONGODB_URI=mongodb://localhost:27017/rentonway_db >> backend\.env
    echo JWT_SECRET=your_jwt_secret_key_here >> backend\.env
    echo FRONTEND_URL=http://localhost:3000 >> backend\.env
)

if not exist frontend\.env (
    echo [WARNING] frontend/.env file is missing.
    echo Creating a sample .env file...
    echo VITE_BACKEND_URL=http://localhost:5000 > frontend\.env
)

echo.
echo Issues fixed. Press any key to return to the menu...
pause > nul
goto MENU

:VIEW_LOGS
echo.
echo ===================================================
echo       VIEW APPLICATION LOGS
echo ===================================================
echo.
echo 1. Backend logs (last 20 lines)
echo 2. Return to menu
echo.
set /p LOG_CHOICE=Enter your choice (1-2): 

if "%LOG_CHOICE%"=="1" (
    echo.
    echo Backend logs:
    echo.
    if exist backend\logs\app.log (
        type backend\logs\app.log | tail -n 20
    ) else (
        echo No log file found.
    )
    echo.
    echo Press any key to return to the menu...
    pause > nul
)
goto MENU

:EXIT
echo.
echo Thank you for using the RentOnWay Troubleshooting Utility.
echo Goodbye!
exit /b 0 