# Remove .md files from git tracking (except README files)
$mdFiles = @(
    "backend\VERCEL_VS_RENDER.md",
    "backend\DEPLOYMENT_RENDER.md",
    "backend\DEPLOYMENT.md",
    "backend\PRODUCTION_SECURITY.md",
    "backend\PRODUCTION_READY.md",
    "backend\RLS_SECURITY_SUMMARY.md",
    "backend\CSV_IMPORT_GUIDE.md",
    "backend\PASSWORD_RESET_SETUP.md",
    "backend\ANALYTICS_API.md"
)

foreach ($file in $mdFiles) {
    if (Test-Path $file) {
        Write-Host "Removing $file from git tracking..."
        git rm --cached $file
    }
}

Write-Host "Done! Remember to commit these changes."
