# Reset Database and Apply Fresh Migrations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Reset & Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will delete all data in your database!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? Type 'YES' to proceed"
if ($confirmation -ne 'YES') {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit
}

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "[Step 1/3] Resetting database..." -ForegroundColor Green
Write-Host ""

try {
    npx prisma migrate reset --force
    
    if ($LASTEXITCODE -ne 0) {
        throw "Database reset failed with exit code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "[Step 2/3] Applying fresh migrations..." -ForegroundColor Green
    Write-Host ""
    
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -ne 0) {
        throw "Migration deploy failed with exit code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "[Step 3/3] Generating Prisma client..." -ForegroundColor Green
    Write-Host ""
    
    npx prisma generate
    
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generate failed with exit code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Database reset complete." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your development server"
    Write-Host "2. Create a new admin user if needed"
    Write-Host "3. Test the PDI request form"
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Read-Host "Press Enter to exit"
