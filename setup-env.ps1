# Setup script for Inchat development environment (Windows PowerShell)
# Usage: .\setup-env.ps1

Write-Host "🚀 Inchat Environment Setup" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Check if .env.example exists
if (-not (Test-Path ".env.example")) {
    Write-Host "❌ .env.example not found" -ForegroundColor Red
    exit 1
}

# Create .env.development if it doesn't exist
if (-not (Test-Path ".env.development")) {
    Write-Host "📝 Creating .env.development from .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env.development"
    Write-Host "✅ Created .env.development" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.development already exists, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Environment Variables to Configure" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Edit .env.development with your local settings:"
Write-Host ""
Write-Host "1. DATABASE_URL"
Write-Host "   - Local PostgreSQL: postgresql://postgres:postgres@localhost:5432/inchat_dev"
Write-Host "   - Docker: postgresql://postgres:postgres@postgres:5432/inchat_dev"
Write-Host ""
Write-Host "2. JWT_SECRET"
Write-Host "   - Use any string (min 32 chars): dev-secret-min-32-chars-long-string"
Write-Host ""
Write-Host "3. REDIS_URL (Optional)"
Write-Host "   - Local: redis://localhost:6379"
Write-Host "   - Docker: redis://redis:6379"
Write-Host ""
Write-Host "4. NEXT_PUBLIC_API_URL"
Write-Host "   - Local: http://localhost:3000"
Write-Host ""
Write-Host "5. NEXT_PUBLIC_SOCKET_IO_URL"
Write-Host "   - Local: http://localhost:3000"
Write-Host ""

# Ask if user wants to open .env.development
$openFile = Read-Host "Do you want to open .env.development now? (y/n)"
if ($openFile -eq 'y' -or $openFile -eq 'Y') {
    Start-Process ".env.development"
}

Write-Host ""
Write-Host "📦 Installing Dependencies" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🗄️  Setting Up Database" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
$setupDb = Read-Host "Do you want to set up the database now? (y/n)"
if ($setupDb -eq 'y' -or $setupDb -eq 'Y') {
    Write-Host "Pushing schema to database..."
    npm run db:push
    Write-Host "✅ Database schema pushed" -ForegroundColor Green
    
    Write-Host ""
    $seedDb = Read-Host "Do you want to seed the database? (y/n)"
    if ($seedDb -eq 'y' -or $seedDb -eq 'Y') {
        npm run db:seed
        Write-Host "✅ Database seeded" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit .env.development with your database credentials"
Write-Host "2. Start development server: npm run dev"
Write-Host "3. Open http://localhost:3000 in your browser"
Write-Host ""
Write-Host "For more info, see:"
Write-Host "- QUICK_SETUP.md - Quick reference guide"
Write-Host "- ENVIRONMENT_SETUP.md - Detailed multi-environment guide"
Write-Host "- README.md - Full documentation"
