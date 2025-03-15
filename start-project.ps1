# PowerShell script to start the RentOnWay project

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       STARTING RENTONWAY PROJECT" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/3] Checking MongoDB connection..." -ForegroundColor Yellow

# Try to connect to MongoDB
try {
    $mongoStatus = mongosh --eval "db.runCommand({ping:1})" --quiet
    Write-Host "[SUCCESS] MongoDB is running and accessible." -ForegroundColor Green
} catch {
    Write-Host "[WARNING] MongoDB connection check failed." -ForegroundColor Red
    Write-Host "The application may not work correctly without a database connection." -ForegroundColor Red
    Write-Host ""
    Write-Host "MongoDB URI in your .env file:" -ForegroundColor Yellow
    Get-Content -Path "backend\.env" | Select-String "MONGODB_URI"
    Write-Host ""
    Write-Host "Press any key to continue anyway or CTRL+C to abort..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd backend && npm run dev"

Write-Host ""
Write-Host "Waiting for backend to initialize (10 seconds)..." -ForegroundColor Yellow
Write-Host "This ensures the API is ready before starting the frontend." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[3/3] Starting Frontend Server..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd frontend && npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "       RENTONWAY PROJECT STARTED SUCCESSFULLY" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "* To test the connection, visit: http://localhost:3000" -ForegroundColor Yellow
Write-Host "* The connection status will be displayed on the home page" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 