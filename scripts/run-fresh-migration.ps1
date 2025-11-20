param(
  [switch]$Force,
  [switch]$DryRun
)

# Wrapper to run the drop script then migration. Use it carefully.
# Usage: pwsh ./scripts/run-fresh-migration.ps1 -Force (to actually drop and migrate)

$dropScript = "$(Join-Path $PSScriptRoot '..\database-schema\clean\00_drop_all_public.sql')"

if (-not (Test-Path $dropScript)) {
  Write-Error "Drop script not found: $dropScript"
  exit 2
}

if (-not $Force) {
  Write-Warning 'This will drop ALL objects in the public schema. Pass -Force to proceed (and back up your DB first).'
  $confirmation = Read-Host 'Type YES to proceed'
  if ($confirmation -ne 'YES') {
    Write-Host 'Aborting.'
    exit 0
  }
}

# Use psql to run the script. Client must have PG connection info via env or .pgpass.
$envDb = $env:DATABASE_URL
if (-not $envDb) {
  Write-Host 'DATABASE_URL not set. Please set it before running.'
  exit 2
}

# Expand the `-v FORCE=1` to pass psql variable to enable the script.
$psql = 'psql'
$cmd = "-v FORCE=1 -d `"$envDb`" -f `"$dropScript`""

Write-Host "Executing drop script: $dropScript"

$dropResult = & $psql $cmd
if ($LASTEXITCODE -ne 0) {
  Write-Error "Drop script failed with code $LASTEXITCODE. Aborting."
  exit $LASTEXITCODE
}

Write-Host 'Drop script executed successfully.'

# Now run migrations
if ($DryRun) {
  Write-Host 'Dry-run migration: running `npm run db:migrate:dry-run`'
  npm run db:migrate:dry-run
} else {
  Write-Host 'Running `npm run db:migrate`'
  npm run db:migrate
}

if ($LASTEXITCODE -ne 0) {
  Write-Error "Migration runner failed with exit code $LASTEXITCODE."
  exit $LASTEXITCODE
}

Write-Host 'Fresh migration completed.'
