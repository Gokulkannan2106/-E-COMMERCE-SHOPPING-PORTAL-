@echo off
setlocal
cd /d "%~dp0"
set DB_ENGINE=sqlite

if exist "%~dp0venv\Scripts\python.exe" (
    "%~dp0venv\Scripts\python.exe" "%~dp0manage.py" %*
) else (
    python "%~dp0manage.py" %*
)
