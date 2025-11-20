<#
  deploy-vercel.ps1 — helper to deploy using Vercel CLI
  Requirements:
   - Signed into vercel CLI (vercel login)
   - Project imported or linked to Vercel
   - Required env vars set on Vercel (JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL, NEXT_PUBLIC_APP_URL)

  Use:
   - Run: pwsh ./scripts/deploy-vercel.ps1 -Prod
   - This script builds locally and then pushes a prod deploy via vercel CLI
#>

param(
    [switch]$Prod
)

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Error "Vercel CLI not found. Install it with 'npm i -g vercel' and run 'vercel login' first."
    exit 1
}

Write-Host "Building Next.js app..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit $LASTEXITCODE }

if ($Prod) {
    Write-Host "Deploying to Vercel (production)..."
    vercel --prod
} else {
    Write-Host "Deploying to Vercel (preview)..."
    vercel
}
