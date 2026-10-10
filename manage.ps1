# PowerShell wrapper for manage.py
Set-Location $PSScriptRoot
$env:DB_ENGINE = "sqlite"

$PYTHON = "$PSScriptRoot\venv\Scripts\python.exe"
if (-not (Test-Path $PYTHON)) {
    $PYTHON = "python"
}

& $PYTHON "$PSScriptRoot\manage.py" @args
