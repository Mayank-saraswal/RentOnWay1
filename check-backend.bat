@echo off
echo ===================================================
echo       CHECKING BACKEND API STATUS
echo ===================================================

echo.
echo Attempting to connect to Backend API at http://localhost:5000...

:: Try to connect to the backend API using curl
curl -s -o nul -w "%%{http_code}" http://localhost:5000 > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

:: Check if the connection was successful
if "%STATUS%"=="200" (
    echo.
    echo [SUCCESS] Backend API is running and accessible.
    echo Response status code: %STATUS%
    echo.
    exit /b 0
) else (
    echo.
    echo [ERROR] Could not connect to Backend API.
    if "%STATUS%"=="" (
        echo No response received. The server might not be running.
    ) else (
        echo Response status code: %STATUS%
    )
    echo.
    echo Please check:
    echo 1. Is the backend server running? (cd backend ^&^& npm run dev)
    echo 2. Is port 5000 available or is it being used by another application?
    echo 3. Check backend logs for any errors.
    echo.
    echo ===================================================
    echo.
    exit /b 1
) 