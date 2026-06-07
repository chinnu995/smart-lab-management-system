# Smart Lab Management System — Troubleshooting Tool
# Run this script in PowerShell to diagnose backend, port, database, and env issues.

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " SMART LAB MANAGEMENT SYSTEM — TROUBLESHOOTING UTILITY" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Port 5005 (Backend Port)
Write-Host "[1/4] Checking Backend Port (5005)..." -ForegroundColor Yellow
$backendPort = 5005
$backendConn = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue

if ($backendConn) {
    $pid = $backendConn[0].OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    $processName = $process ? $process.ProcessName : "Unknown"
    
    Write-Host "  -> Port $backendPort is currently OCCUPIED." -ForegroundColor Red
    Write-Host "  -> Process ID (PID): $pid ($processName)" -ForegroundColor Red
    Write-Host "  -> WARNING: If a zombie 'node' process is running on this port, nodemon may bind to port 5006 instead," -ForegroundColor DarkYellow
    Write-Host "     which will break frontend-backend communication." -ForegroundColor DarkYellow
    Write-Host ""
    
    $choice = Read-Host "Would you like to terminate this process (PID $pid) to free up port $backendPort? (Y/N)"
    if ($choice -eq 'Y' -or $choice -eq 'y') {
        Stop-Process -Id $pid -Force
        Write-Host "  -> Successfully terminated process $pid." -ForegroundColor Green
    } else {
        Write-Host "  -> Skipped process termination." -ForegroundColor Yellow
    }
} else {
    Write-Host "  -> Port $backendPort is FREE. Excellent!" -ForegroundColor Green
}
Write-Host ""

# 2. Check Port 3306 (MySQL Port)
Write-Host "[2/4] Checking Database Port (3306)..." -ForegroundColor Yellow
$mysqlPort = 3306
$mysqlConn = Get-NetTCPConnection -LocalPort $mysqlPort -ErrorAction SilentlyContinue

if ($mysqlConn) {
    $mysqlPid = $mysqlConn[0].OwningProcess
    $mysqlProcess = Get-Process -Id $mysqlPid -ErrorAction SilentlyContinue
    $mysqlProcessName = $mysqlProcess ? $mysqlProcess.ProcessName : "Unknown"
    Write-Host "  -> Database port $mysqlPort is occupied by PID $mysqlPid ($mysqlProcessName)." -ForegroundColor Green
    Write-Host "  -> MySQL is running and listening!" -ForegroundColor Green
} else {
    Write-Host "  -> MySQL port $mysqlPort is NOT listening!" -ForegroundColor Red
    Write-Host "  -> Make sure your local MySQL server is started." -ForegroundColor Red
}
Write-Host ""

# 3. Check configuration files
Write-Host "[3/4] Checking Environment Configuration..." -ForegroundColor Yellow
$envPath = Join-Path (Get-Location) ".env"
$backendEnvPath = Join-Path (Join-Path (Get-Location) "backend") ".env"

if (Test-Path $backendEnvPath) {
    Write-Host "  -> Backend .env file found." -ForegroundColor Green
    $envContent = Get-Content $backendEnvPath
    $hasJwt = $envContent | Select-String "JWT_SECRET=" -Quiet
    $hasDb = $envContent | Select-String "DB_PASSWORD=" -Quiet
    $hasGmail = $envContent | Select-String "GMAIL_USER=" -Quiet
    
    if (-not $hasJwt) {
        Write-Host "  -> Warning: JWT_SECRET is not configured in backend/.env." -ForegroundColor Yellow
    }
    if (-not $hasDb) {
        Write-Host "  -> Warning: DB_PASSWORD is not configured in backend/.env." -ForegroundColor Yellow
    }
    if (-not $hasGmail) {
        Write-Host "  -> Note: GMAIL_USER is not configured in backend/.env (standard SMTP fallback will be used)." -ForegroundColor Cyan
    }
} else {
    Write-Host "  -> Error: backend/.env file is missing!" -ForegroundColor Red
}
Write-Host ""

# 4. Check dependencies & node modules
Write-Host "[4/4] Checking Node Modules..." -ForegroundColor Yellow
$backendModules = Join-Path (Join-Path (Get-Location) "backend") "node_modules"
$frontendModules = Join-Path (Join-Path (Get-Location) "frontend") "node_modules"

if (Test-Path $backendModules) {
    Write-Host "  -> Backend node_modules exist." -ForegroundColor Green
} else {
    Write-Host "  -> Error: backend/node_modules are missing! Run 'npm install' inside backend/ directory." -ForegroundColor Red
}

if (Test-Path $frontendModules) {
    Write-Host "  -> Frontend node_modules exist." -ForegroundColor Green
} else {
    Write-Host "  -> Error: frontend/node_modules are missing! Run 'npm install' inside frontend/ directory." -ForegroundColor Red
}
Write-Host ""
Write-Host "Troubleshooting check completed." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
