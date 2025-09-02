Param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location -Path (Split-Path $MyInvocation.MyCommand.Definition)

function Install-Tool {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $true)][string]$InstallCommand
  )
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    Write-Host "Installing $Command..."
    Invoke-Expression $InstallCommand
  }
}

# Core tooling (Git/Node/Docker/Supabase CLI)
Install-Tool git      "winget install -e --id Git.Git"
Install-Tool node     "winget install -e --id OpenJS.NodeJS.LTS"
Install-Tool docker   "winget install -e --id Docker.DockerDesktop"
Install-Tool supabase "winget upgrade -e --id Supabase.Supabase; winget install -e --id Supabase.Supabase"

# Verify Docker is running
try { docker info | Out-Null } catch {
  Write-Host "Docker isn't running. Open Docker Desktop and run this script again." -ForegroundColor Yellow
  exit 1
}

# Start (or confirm) Supabase local stack
supabase start

# Create storage buckets (idempotent; ignore errors if they exist)
try { supabase storage create-bucket reports  | Out-Null } catch {}
try { supabase storage create-bucket letters  | Out-Null } catch {}

# Read status to capture URLs/keys
$status = supabase status
$apiUrl = ($status | Select-String 'API URL').Line -replace 'API URL:\s*', ''
$dbUrl = ($status | Select-String 'DB URL').Line -replace 'DB URL:\s*', ''
$anonKey = ($status | Select-String 'anon key').Line -replace 'anon key:\s*', ''
$svcKey = ($status | Select-String 'service_role key').Line -replace 'service_role key:\s*', ''

# Write .env.local for app + functions
$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$svcKey
"@
Set-Content -Encoding UTF8 .env.local $envContent

# Make DB URL available to child processes (npm/supabase)
$env:SUPABASE_DB_URL = $dbUrl

# Install deps
npm install

# Generate types BEFORE seeding (fixes the ERR_MODULE_NOT_FOUND)
npm run types:gen

# Apply SQL with the Supabase CLI (no psql needed)
npm run db:apply

# Seed data
npm run db:seed

# Run functions locally (uses .env.local)
$functions = Start-Process cmd -ArgumentList '/c', 'supabase', 'functions', 'serve', '--env-file', '.env.local' -PassThru

# Start the web app
$dev = Start-Process npm -ArgumentList "run", "dev" -PassThru
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

# Wait only if the process actually started
if ($dev -and -not $dev.HasExited) {
  Wait-Process -Id $dev.Id
}

# Clean up functions process if it's still alive
if ($functions -and -not $functions.HasExited) {
  Stop-Process -Id $functions.Id -Force
}

Read-Host -Prompt "Press Enter to exit"
