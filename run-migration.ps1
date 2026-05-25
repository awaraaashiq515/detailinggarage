# PDI System Database Migration Script
# Run this script to apply database changes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PDI System Database Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Run Prisma migration to add vehicle details"
Write-Host "2. Generate updated Prisma client"
Write-Host "3. Fix TypeScript errors"
Write-Host ""

$confirmation = Read-Host "Continue? (Y/N)"
if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host "Migration cancelled." -ForegroundColor Red
    exit
}

# Change to script directory
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "[Step 1/2] Running database migration..." -ForegroundColor Green
Write-Host ""

try {
    npx prisma migrate dev --name add_vehicle_details_to_pdi_request
    
    if ($LASTEXITCODE -ne 0) {
        throw "Migration failed with exit code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "[Step 2/2] Generating Prisma client..." -ForegroundColor Green
    Write-Host ""
    
    npx prisma generate
    
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generate failed with exit code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Migration completed." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your development server (npm run dev)"
    Write-Host "2. Test the client PDI request form at /client/pdi-confirmation"
    Write-Host "3. Test the admin dashboard at /admin/requests"
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error message above and try again." -ForegroundColor Yellow
    exit 1
}

Read-Host "Press Enter to exit"
