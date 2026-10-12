<#
.SYNOPSIS
    Runs audit quality gates on Windows PowerShell.
.DESCRIPTION
    Executes Python and npm gates from a repository checkout.
#>
[CmdletBinding()]
param (
    [string]$TwinPython = 'python',
    [switch]$AuditHostedSite
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir '..')).Path
Push-Location $RepoRoot

try {
    $lock = Join-Path $RepoRoot 'apps\web\package-lock.json'
    $nodeModules = Join-Path $RepoRoot 'apps\web\node_modules'

    if (-not (Test-Path $lock) -or -not (Test-Path $nodeModules)) {
        Write-Error 'Install Node 24 and run npm --prefix apps/web ci --ignore-scripts first.'
        exit 2
    }

    Write-Host 'Running Python reference tests...'
    & $TwinPython -m unittest discover -s tests -v
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Running CLI smoke simulation...'
    & $TwinPython -m datacenter_twin simulate --preset generator_failure --format markdown | Out-Null
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Checking code format...'
    npm --prefix apps/web run format:check
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Building web application...'
    npm --prefix apps/web run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Fetching study runtime and preparing browser demo...'
    & $TwinPython scripts\fetch_study_runtime.py
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $TwinPython scripts\prepare_browser_demo.py
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Running JS engine tests...'
    npm --prefix apps/web run test:engine
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Building demo...'
    npm --prefix apps/web run build:demo
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Running demo tests (Playwright)...'
    npm --prefix apps/web run test:demo
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    if ($AuditHostedSite -or ($env:AUDIT_HOSTED_SITE -eq '1')) {
        Write-Host 'Auditing hosted site...'
        & $TwinPython scripts\audit_public_site.py --strict-seo --out outputs\audit\public-site.json
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }

    Write-Host 'Local audit gates passed. Deployment, field-vitals measurement and merge remain separate steps.'
} finally {
    Pop-Location
}
