param(
    [switch]$SkipInstall,
    [switch]$BootstrapOnly
)

$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

$venvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$venvPip = Join-Path $PSScriptRoot ".venv\Scripts\pip.exe"

if (-not (Test-Path $venvPython)) {
    $pythonLauncher = if (Get-Command py -ErrorAction SilentlyContinue) {
        'py'
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        'python'
    } else {
        throw "Python was not found. Install Python 3.10+ and ensure 'py' or 'python' is available in PATH."
    }

    Write-Host "[Wandrix] Creating virtual environment (.venv)..."
    & $pythonLauncher -m venv ".venv"
}

if (-not $SkipInstall) {
    Write-Host "[Wandrix] Installing/updating backend dependencies..."
    & $venvPip install -r "requirements.txt"
}

if ($BootstrapOnly) {
    Write-Host "[Wandrix] Bootstrap complete."
    exit 0
}

Write-Host "[Wandrix] Starting backend on http://localhost:5000 ..."
& $venvPython "app.py"
