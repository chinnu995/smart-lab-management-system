# Smart Lab Management System — Troubleshooting Tool (Supabase / PostgreSQL Edition)
# Run this script in PowerShell to diagnose backend, port, Supabase database, and env issues.

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

# 2. Check Database Configuration (Supabase / PostgreSQL)
Write-Host "[2/4] Checking Supabase & Database Credentials..." -ForegroundColor Yellow
$backendEnvPath = Join-Path (Join-Path (Get-Location) "backend") ".env"

if (Test-Path $backendEnvPath) {
    $envContent = Get-Content $backendEnvPath
    $hasSupaUrl = $envContent | Select-String "SUPABASE_URL=" -Quiet
    $hasDbUrl = $envContent | Select-String "DATABASE_URL=" -Quiet

    if ($hasSupaUrl -or $hasDbUrl) {
        Write-Host "  -> Supabase / PostgreSQL database configuration detected in backend/.env." -ForegroundColor Green
    } else {
        Write-Host "  -> Warning: Neither SUPABASE_URL nor DATABASE_URL found in backend/.env!" -ForegroundColor Red
    }
} else {
    Write-Host "  -> Error: backend/.env file is missing!" -ForegroundColor Red
}
Write-Host ""

# 3. Check configuration files
Write-Host "[3/4] Checking Environment Configuration..." -ForegroundColor Yellow
if (Test-Path $backendEnvPath) {
    Write-Host "  -> Backend .env file found." -ForegroundColor Green
    $envContent = Get-Content $backendEnvPath
    $hasJwt = $envContent | Select-String "JWT_SECRET=" -Quiet
    $hasGmail = $envContent | Select-String "GMAIL_USER=" -Quiet
    
    if (-not $hasJwt) {
        Write-Host "  -> Warning: JWT_SECRET is not configured in backend/.env." -ForegroundColor Yellow
    }
    if (-not $hasGmail) {
        Write-Host "  -> Note: GMAIL_USER is not configured in backend/.env (standard SMTP fallback will be used)." -ForegroundColor Cyan
    }
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
