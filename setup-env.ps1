# Cognify-AI Environment Setup Script (PowerShell)
# This script helps set up the .env file for the backend

Write-Host "🚀 Setting up Cognify-AI Backend Environment" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Check if .env already exists
if (Test-Path "backend/.env") {
    $response = Read-Host "⚠️  backend/.env already exists. Do you want to overwrite it? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Copy the example file
Copy-Item "backend/.env.example" "backend/.env"
Write-Host "✅ Created backend/.env from example file" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Please edit backend/.env with your configuration:" -ForegroundColor Cyan
Write-Host "   - Set DATABASE_URL if using PostgreSQL"
Write-Host "   - Set JWT_SECRET and REFRESH_TOKEN_SECRET for production"
Write-Host "   - Add AI provider API keys like GEMINI_API_KEY"
Write-Host "   - Adjust CORS_ORIGIN if needed"
Write-Host ""
Write-Host "For development, you can use the defaults with mock provider."
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit backend/.env with your settings"
Write-Host "  2. Run: pnpm dev"
Write-Host ""
