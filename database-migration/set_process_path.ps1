# Add Postgres bin to this process PATH so commands are usable in current shell
$bin = 'C:\Program Files\PostgreSQL\18\bin'
$current = [Environment]::GetEnvironmentVariable('PATH', 'Process')
if ($current -notlike "*PostgreSQL*" -or $current -notlike "*$bin*") {
    [Environment]::SetEnvironmentVariable('PATH', $current + ';' + $bin, 'Process')
    Write-Host "Added $bin to Process PATH"
} else {
    Write-Host "Process PATH already contains $bin"
}

# Test
Write-Host "psql --version:"; & psql --version
Write-Host "pg_dump --version:"; & pg_dump --version
