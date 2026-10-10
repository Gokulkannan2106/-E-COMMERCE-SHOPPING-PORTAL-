@echo off
echo =========================================================
echo    AURA STORE - FULL-STACK E-COMMERCE (SINGLE LINK)
echo =========================================================
echo.

set DB_ENGINE=sqlite

echo [1/3] Running database migrations...
"%~dp0venv\Scripts\python.exe" "%~dp0manage.py" migrate
if %ERRORLEVEL% neq 0 (
    echo ERROR: Migrations failed.
    pause
    exit /b 1
)

echo.
echo [2/3] Building React frontend...
cd /d "%~dp0frontend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm run build failed. Run "npm install" in the frontend folder first.
    cd /d "%~dp0"
    pause
    exit /b 1
)
cd /d "%~dp0"

echo.
echo =========================================================
echo  SINGLE PROJECT LINK:   http://127.0.0.1:8000/
echo.
echo  Store Home     -^>  http://127.0.0.1:8000/
echo  Explore Shop   -^>  http://127.0.0.1:8000/shop
echo  Wishlist       -^>  http://127.0.0.1:8000/wishlist
echo  My Orders      -^>  http://127.0.0.1:8000/orders
echo  Merchant Dash  -^>  http://127.0.0.1:8000/admin
echo  Django Admin   -^>  http://127.0.0.1:8000/django-admin/
echo  REST API       -^>  http://127.0.0.1:8000/api/
echo.
echo  Login:  admin / admin123   ^|   johndoe / password123
echo =========================================================
echo.
echo [3/3] Starting Django server... Press Ctrl+C to stop.
echo.
start http://127.0.0.1:8000/
"%~dp0venv\Scripts\python.exe" "%~dp0manage.py" runserver 127.0.0.1:8000
