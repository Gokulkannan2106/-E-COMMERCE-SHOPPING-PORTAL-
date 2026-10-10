# AURA STORE - Single-Link Startup Script (PowerShell)
# Run this from the project root:  .\start_server.ps1

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   AURA STORE - FULL-STACK E-COMMERCE  (SINGLE LINK)    " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

$PYTHON = "$PSScriptRoot\venv\Scripts\python.exe"

if (-not (Test-Path $PYTHON)) {
    Write-Host "ERROR: venv not found at $PYTHON" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Use SQLite (no MySQL needed)
$env:DB_ENGINE = "sqlite"

# Step 1: Migrate
Write-Host "[1/3] Running database migrations..." -ForegroundColor Yellow
& $PYTHON manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migrations failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Build React frontend
Write-Host ""
Write-Host "[2/3] Building React frontend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm run build failed. Run 'npm install' first." -ForegroundColor Red
    Set-Location $PSScriptRoot
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location $PSScriptRoot

# Step 3: Launch
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  >>> SINGLE PROJECT LINK:  http://127.0.0.1:8000/  <<<"  -ForegroundColor Green
Write-Host ""
Write-Host "  Store Home     ->  http://127.0.0.1:8000/"              -ForegroundColor White
Write-Host "  Explore Shop   ->  http://127.0.0.1:8000/shop"          -ForegroundColor White
Write-Host "  Wishlist       ->  http://127.0.0.1:8000/wishlist"      -ForegroundColor White
Write-Host "  My Orders      ->  http://127.0.0.1:8000/orders"        -ForegroundColor White
Write-Host "  Merchant Dash  ->  http://127.0.0.1:8000/admin"         -ForegroundColor White
Write-Host "  Django Admin   ->  http://127.0.0.1:8000/django-admin/" -ForegroundColor White
Write-Host "  REST API       ->  http://127.0.0.1:8000/api/"          -ForegroundColor White
Write-Host ""
Write-Host "  Login Credentials:" -ForegroundColor DarkGray
Write-Host "    Admin:    admin / admin123" -ForegroundColor DarkGray
Write-Host "    Customer: johndoe / password123" -ForegroundColor DarkGray
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "[3/3] Django server running... Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

Start-Process "http://127.0.0.1:8000/"
& $PYTHON manage.py runserver 127.0.0.1:8000
