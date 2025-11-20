# PowerShell helper to repair node modules and re-install dependencies
# Use with caution. Run in repository root (src) and as an Administrator if necessary.

Write-Output "⚙️ Starting dependency repair script..."

# Check for node and npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node is not installed or not in PATH. Please install Node >= 18."
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm is not installed or not in PATH."
  exit 1
}

# Attempt to terminate any long-running Node sessions that might hold files locked
Write-Output "Stopping node processes that might hold files..."
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue } catch {} }

# Delete troublesome prebuilds (targeting bufferutil by default)
$bufferutilPath = Join-Path $PWD 'node_modules\bufferutil\prebuilds\win32-x64\bufferutil.node'
if (Test-Path $bufferutilPath) {
  Write-Output "Removing locked bufferutil binary: $bufferutilPath"
  try { Remove-Item -Path $bufferutilPath -Force -ErrorAction Stop; Write-Output "Removed bufferutil binary." } catch { Write-Warning "Failed to remove bufferutil node: $_" }
}

# Optionally remove the entire node_modules folder if it exists
$nodeModules = Join-Path $PWD 'node_modules'
if (Test-Path $nodeModules) {
  Write-Output "Removing existing node_modules (this may take a while)..."
  try { Remove-Item -Path $nodeModules -Recurse -Force -ErrorAction Stop; Write-Output "Removed node_modules" } catch { Write-Warning "Failed to remove node_modules: $_" }
}

# Clear npm cache
Write-Output "Clearing npm cache..."
try { npm cache clean --force } catch { Write-Warning "npm cache clean failed" }

# Reinstall dependencies without optional/native modules (safe approach for Windows)
Write-Output "Reinstalling dependencies with --no-optional (skips native optional deps like bufferutil)"
try { npm ci --no-optional } catch { Write-Error "npm install failed. Try running as admin or investigate the log.`n"; exit 1 }

Write-Output "✅ Dependencies repaired. Run: npm run db:migrate or npm run db:migrate:dry-run"

exit 0
