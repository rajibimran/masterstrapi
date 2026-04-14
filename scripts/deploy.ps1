# Deploy unvback on Windows (PowerShell): install, build, start.
# Usage: .\scripts\deploy.ps1
# Run from repository root, or: Set-Location unvback; .\scripts\deploy.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path .env)) {
    Write-Error "Missing .env — copy .env.example to .env and fill secrets + database."
}

Write-Host "==> npm ci"
npm ci

Write-Host "==> npm run build"
npm run build

Write-Host "==> npm run start (foreground — use a service wrapper in production)"
npm run start
