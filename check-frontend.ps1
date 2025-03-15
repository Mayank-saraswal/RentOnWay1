# PowerShell script to check the status of the frontend

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       CHECKING FRONTEND STATUS" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Attempting to connect to Frontend at http://localhost:3000..." -ForegroundColor Yellow

# Try to connect to the frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    $statusCode = $response.StatusCode
    
    if ($statusCode -eq 200) {
        Write-Host ""
        Write-Host "[SUCCESS] Frontend is running and accessible." -ForegroundColor Green
        Write-Host "Response status code: $statusCode" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[WARNING] Frontend returned an unexpected status code: $statusCode" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Could not connect to Frontend." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Is the frontend server running? (cd frontend && npm run dev)" -ForegroundColor Yellow
    Write-Host "2. Is port 3000 available or is it being used by another application?" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 