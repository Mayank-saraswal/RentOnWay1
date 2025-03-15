# PowerShell script to check the status of all RentOnWay services

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       CHECKING RENTONWAY SERVICES STATUS" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Function to check if a service is running
function Test-ServiceConnection {
    param (
        [string]$ServiceName,
        [string]$Url
    )
    
    Write-Host ""
    Write-Host "Checking $ServiceName at $Url..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200) {
            Write-Host "[SUCCESS] $ServiceName is running and accessible." -ForegroundColor Green
            Write-Host "Response status code: $statusCode" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[WARNING] $ServiceName returned an unexpected status code: $statusCode" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "[ERROR] Could not connect to $ServiceName." -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to check if MongoDB is running
function Test-MongoDBConnection {
    Write-Host ""
    Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
    
    try {
        $mongoStatus = mongosh --eval "db.runCommand({ping:1})" --quiet
        Write-Host "[SUCCESS] MongoDB is running and accessible." -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[ERROR] Could not connect to MongoDB." -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to check if Node.js processes are running
function Test-NodeProcesses {
    Write-Host ""
    Write-Host "Checking Node.js processes..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        Write-Host "[INFO] Found the following Node.js processes:" -ForegroundColor Green
        $nodeProcesses | ForEach-Object {
            Write-Host "  - Process ID: $($_.Id), Start Time: $($_.StartTime)" -ForegroundColor Gray
        }
        return $true
    } else {
        Write-Host "[WARNING] No Node.js processes found." -ForegroundColor Yellow
        return $false
    }
}

# Check MongoDB
$mongoDBStatus = Test-MongoDBConnection

# Check Backend
$backendStatus = Test-ServiceConnection -ServiceName "Backend API" -Url "http://localhost:5000"

# Check Frontend
$frontendStatus = Test-ServiceConnection -ServiceName "Frontend" -Url "http://localhost:3000"

# Check Node.js processes
$nodeStatus = Test-NodeProcesses

# Display summary
Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       RENTONWAY SERVICES STATUS SUMMARY" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

function Write-StatusLine {
    param (
        [string]$ServiceName,
        [bool]$Status
    )
    
    $statusText = if ($Status) { "Running" } else { "Not Running" }
    $statusColor = if ($Status) { "Green" } else { "Red" }
    
    Write-Host "$ServiceName".PadRight(20) -NoNewline
    Write-Host ": " -NoNewline
    Write-Host $statusText -ForegroundColor $statusColor
}

Write-StatusLine -ServiceName "MongoDB" -Status $mongoDBStatus
Write-StatusLine -ServiceName "Backend API" -Status $backendStatus
Write-StatusLine -ServiceName "Frontend" -Status $frontendStatus
Write-StatusLine -ServiceName "Node.js Processes" -Status $nodeStatus

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 