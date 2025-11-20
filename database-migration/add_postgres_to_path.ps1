<#
Script to locate PostgreSQL bin directory (containing psql.exe and pg_dump.exe) and add it to PATH
Usage: .\add_postgres_to_path.ps1 [-Persist]
- If -Persist is passed, add the found path to the user's persistent PATH environment variable.
#>
param(
    [switch]$Persist
)

$commonLocations = @(
    'C:\Program Files\PostgreSQL',
    'C:\Program Files (x86)\PostgreSQL',
    "$env:USERPROFILE\AppData\Local\Programs\PostgreSQL",
    "$env:ProgramFiles\pgAdmin 4\runtime",
    "C:\Program Files\pgAdmin 4\runtime"
)

function Find-PostgresBin {
    foreach ($loc in $commonLocations) {
        if (Test-Path $loc) {
            # Search immediate subfolders for bin folder with psql.exe
            Get-ChildItem -Path $loc -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                $candidate = Join-Path $_.FullName 'bin'
                if ((Test-Path (Join-Path $candidate 'psql.exe') -PathType Leaf -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $candidate 'pg_dump.exe') -PathType Leaf -ErrorAction SilentlyContinue)) {
                    return $candidate
                }
            }
            # also check if psql exists directly under location (some variants)
            if (Test-Path (Join-Path $loc 'bin\psql.exe')) {
                return (Join-Path $loc 'bin')
            }
        }
    }
    return $null
}

$binPath = Find-PostgresBin
if (-not $binPath) {
    Write-Host "No Postgres bin directory auto-detected in common locations."
    Write-Host "Please pass the bin path or set PATH manually. Common path: C:\Program Files\PostgreSQL\<version>\bin"
    exit 1
}

Write-Host "Detected Postgres bin: $binPath"
# Add to session PATH if not present
$pathParts = $env:Path -split ';' | ForEach-Object { $_ }
if ($pathParts -notcontains $binPath) {
    $env:Path = $env:Path + ';' + $binPath
    Write-Host "Added to current session PATH." -ForegroundColor Green
} else {
    Write-Host "Already present in PATH." -ForegroundColor Yellow
}

# Optionally persist to current user PATH
if ($Persist) {
    $currentUserPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
    $parts = $currentUserPath -split ';' | ForEach-Object { $_ }
    if ($parts -notcontains $binPath) {
        $newUserPath = if ($currentUserPath) { $currentUserPath + ';' + $binPath } else { $binPath }
        [Environment]::SetEnvironmentVariable('PATH', $newUserPath, 'User')
        Write-Host "Added to user PATH (requires new session to take effect)." -ForegroundColor Green
    } else {
        Write-Host "Already present in user PATH." -ForegroundColor Yellow
    }
}

# Test versions
Write-Host "psql version:"
& psql --version
Write-Host "pg_dump version:"
& pg_dump --version

Write-Host "Done. If you used -Persist, please start a new shell to pick up the new PATH permanently."