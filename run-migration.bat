@echo off
echo ========================================
echo PDI System Migration - UPDATED
echo ========================================
echo.
echo This script will:
echo 1. Add vehicle details to PDI requests
echo 2. Remove packageId field (causing errors)
echo 3. Add system settings table
echo 4. Generate updated Prisma client
echo.
pause

cd /d "%~dp0"

echo.
echo [Step 1/4] Running vehicle details migration...
echo.
call npx prisma migrate dev --name add_vehicle_details_to_pdi_request

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: First migration failed!
    pause
    exit /b 1
)

echo.
echo [Step 2/4] Removing packageId field...
echo.
call npx prisma migrate dev --name remove_packageid_from_pdi_request

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Second migration failed!
    pause
    exit /b 1
)

echo.
echo [Step 3/4] Adding system settings...
echo.
call npx prisma migrate dev --name add_system_settings

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Third migration failed!
    pause
    exit /b 1
)

echo.
echo [Step 4/4] Generating Prisma client...
echo.
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! All migrations completed.
echo ========================================
echo.
echo Next steps:
echo 1. Restart your development server (npm run dev)
echo 2. Test the package toggle in admin settings
echo 3. Test the client PDI request form
echo.
pause
