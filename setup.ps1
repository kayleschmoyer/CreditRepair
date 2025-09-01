Param()

Set-Location -Path (Split-Path $MyInvocation.MyCommand.Definition)

function Ensure-Tool {
  param(
    [string]$Command,
    [string]$InstallCommand
  )
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    Write-Host "Installing $Command..."
    Invoke-Expression $InstallCommand
  }
}

Ensure-Tool git "winget install -e --id Git.Git"
Ensure-Tool node "winget install -e --id OpenJS.NodeJS.LTS"
Ensure-Tool docker "winget install -e --id Docker.DockerDesktop"
Ensure-Tool supabase "winget install -e --id Supabase.Supabase"

try {
  docker info | Out-Null
} catch {
  Write-Host "Docker does not appear to be running. Open Docker Desktop and run this script again." -ForegroundColor Yellow
  exit 1
}

supabase start

supabase storage create-bucket reports | Out-Null
supabase storage create-bucket letters | Out-Null

$status = supabase status
$apiUrl = ($status | Select-String 'API URL').Line -replace 'API URL:\s*', ''
$dbUrl = ($status | Select-String 'DB URL').Line -replace 'DB URL:\s*', ''
$anonKey = ($status | Select-String 'anon key').Line -replace 'anon key:\s*', ''
$serviceKey = ($status | Select-String 'service_role key').Line -replace 'service_role key:\s*', ''

@"""
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
"""@ | Set-Content -Encoding UTF8 .env.local

$env:SUPABASE_DB_URL = $dbUrl
npm run db:apply
npm run db:seed

$functions = Start-Process supabase -ArgumentList "functions serve --env-file .env.local" -PassThru

npm install
$dev = Start-Process npm -ArgumentList "run","dev" -PassThru
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
Wait-Process $dev.Id
Stop-Process $functions.Id
