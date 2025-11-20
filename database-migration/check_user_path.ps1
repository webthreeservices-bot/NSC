$uPath = [Environment]::GetEnvironmentVariable('Path','User')
Write-Host "User Path: $uPath"
if ($uPath -match 'PostgreSQL') { Write-Host 'Found Postgres in user PATH' -ForegroundColor Green } else { Write-Host 'Not found' -ForegroundColor Red }