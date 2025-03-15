# PowerShell script to stop all RentOnWay services

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       STOPPING RENTONWAY SERVICES" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Stopping Backend and Frontend servers..." -ForegroundColor Yellow

# Find and stop Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found the following Node.js processes:" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "  - Process ID: $($_.Id), Start Time: $($_.StartTime)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        try {
            $_ | Stop-Process -Force
            Write-Host "  - Stopped process ID: $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  - Failed to stop process ID: $($_.Id)" -ForegroundColor Red
            Write-Host "    Error: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No Node.js processes found." -ForegroundColor Yellow
}

# Find and stop cmd.exe processes that might be running npm
$cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -match "npm run dev"
}

if ($cmdProcesses) {
    Write-Host ""
    Write-Host "Found the following cmd processes running npm:" -ForegroundColor Yellow
    $cmdProcesses | ForEach-Object {
        Write-Host "  - Process ID: $($_.Id), Window Title: $($_.MainWindowTitle)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Stopping all cmd processes running npm..." -ForegroundColor Yellow
    $cmdProcesses | ForEach-Object {
        try {
            $_ | Stop-Process -Force
            Write-Host "  - Stopped process ID: $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  - Failed to stop process ID: $($_.Id)" -ForegroundColor Red
            Write-Host "    Error: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host ""
    Write-Host "No cmd processes running npm found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "       RENTONWAY SERVICES STOPPED SUCCESSFULLY" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 