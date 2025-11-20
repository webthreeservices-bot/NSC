<#
PowerShell script to dump Neon Postgres DB schema (including enums) into live_neon_db.sql
- Requires: pg_dump (Postgres client utilities)
- Usage: .\export_live_neon_db.ps1 [-DatabaseUrl <connection_string>] [-OutFile <path>]

This script will read from `.env` if DATABASE_URL not supplied.
#>

param(
    [string]$DatabaseUrl,
    [string]$OutFile
)

function LoadDotEnv($envFilePath) {
    if (Test-Path $envFilePath) {
        Get-Content $envFilePath | ForEach-Object {
            if (-not [string]::IsNullOrWhiteSpace($_) -and $_ -notlike '#*') {
                $line = $_.Trim()
                if ($line -match '^(.*?)=(.*)$') {
                    $name = $matches[1].Trim()
                    $value = $matches[2].Trim()
                    # Remove any surrounding quotes in value
                    $value = $value -replace '(^"|"$)', '' -replace "(^'|'$)", ''
                    Set-Item -Path "env:$name" -Value $value -Force
                }
            }
        }
        return $true
    }
    return $false
}

# Attempt to load `.env` in current directory and database-migration dir
$cwdEnv = Join-Path (Get-Location) '.env'
$dmEnv = "$(Split-Path -Path $MyInvocation.MyCommand.Path -Parent)\.env"
if ((Test-Path $cwdEnv) -or (Test-Path $dmEnv)) {
    if ((LoadDotEnv $dmEnv) -or (LoadDotEnv $cwdEnv)) {
        Write-Host "Loaded .env variables"
    }
}

if (-not $DatabaseUrl) {
    if ($env:DATABASE_URL) {
        $DatabaseUrl = $env:DATABASE_URL
    }
}

if (-not $DatabaseUrl) {
    Write-Host "No Database URL found. Provide via -DatabaseUrl or add DATABASE_URL to a .env file"
    exit 1
}

# Default output path: same directory as the script
if (-not $OutFile) {
    $scriptDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
    $OutFile = Join-Path $scriptDir 'live_neon_db.sql'
}
# Output path - ensure absolute
if (-not [System.IO.Path]::IsPathRooted($OutFile)) {
    $OutFile = Join-Path (Get-Location) $OutFile
}

Write-Host "Will attempt to export schema of the DB to: $OutFile"

function Find-PostgresBinPath {
    $candidates = @(
        'C:\Program Files\PostgreSQL',
        'C:\Program Files (x86)\PostgreSQL',
        "$env:USERPROFILE\AppData\Local\Programs\PostgreSQL",
        "C:\Program Files\pgAdmin 4\runtime",
        "C:\Program Files\pgAdmin 4\runtime\bin"
    )
    foreach ($base in $candidates) {
        if (Test-Path $base) {
            $dirs = Get-ChildItem -Path $base -Directory -ErrorAction SilentlyContinue
            foreach ($d in $dirs) {
                $bin = Join-Path $d.FullName 'bin'
                $pgdumpCandidate = Join-Path $bin 'pg_dump.exe'
                if (Test-Path $pgdumpCandidate -PathType Leaf -ErrorAction SilentlyContinue) { return $pgdumpCandidate }
            }
            # also try base/bin
            $pgdumpCandidate2 = Join-Path $base 'bin\pg_dump.exe'
            if (Test-Path $pgdumpCandidate2 -PathType Leaf -ErrorAction SilentlyContinue) { return $pgdumpCandidate2 }
        }
    }
    return $null
}

# Check for pg_dump
$pg_cmd = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($pg_cmd) {
    $pg_dump_path = $pg_cmd.Source
} else {
    # try common paths
    $found = Find-PostgresBinPath
    if ($found) { $pg_dump_path = $found }
    else { $pg_dump_path = $null }
}
if (-not $pg_dump_path) {
    Write-Warning "pg_dump not found in your PATH. Please install PostgreSQL client tools (pg_dump) and try again."
    Write-Host "You can install the Postgres client using winget/choco or by installing PostgreSQL from https://www.postgresql.org/download/"
    Write-Host "Alternative: run this machine's sonic or CI with pg_dump and this DATABASE_URL to export the schema."
    Write-Host "Now I will print the exact pg_dump command to run manually (copy and run):"
    Write-Host "------------------------------"
    $escapedUrl = $DatabaseUrl
    Write-Host "pg_dump --schema-only --no-owner --no-privileges \"$escapedUrl\" -f \"$OutFile\""
    Write-Host "------------------------------"
    Write-Host "This command exports schema-only including enums; it will not include data."
    exit 1
}

Write-Host "Using pg_dump: $pg_dump_path"

# Build and run pg_dump command
$cmd = "`"$pg_dump_path`" --schema-only --no-owner --no-privileges `"$DatabaseUrl`" -f `"$OutFile`""
Write-Host "Running: $cmd"

# Start process
$proc = Start-Process -FilePath $pg_dump_path -ArgumentList @("--schema-only","--no-owner","--no-privileges", $DatabaseUrl, "-f", $OutFile) -NoNewWindow -Wait -PassThru
if ($proc.ExitCode -eq 0) {
    Write-Host "Export completed successfully: $OutFile"
    exit 0
} else {
    Write-Error "pg_dump failed with exit code $($proc.ExitCode)"
    exit $proc.ExitCode
}
