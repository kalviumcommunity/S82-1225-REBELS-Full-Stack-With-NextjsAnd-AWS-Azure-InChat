#!/bin/bash
# Setup script for Inchat development environment
# Usage: ./setup-env.sh

set -e

echo "🚀 Inchat Environment Setup"
echo "============================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo -e "${YELLOW}❌ .env.example not found${NC}"
    exit 1
fi

# Create .env.development if it doesn't exist
if [ ! -f ".env.development" ]; then
    echo -e "${BLUE}📝 Creating .env.development from .env.example...${NC}"
    cp .env.example .env.development
    echo -e "${GREEN}✅ Created .env.development${NC}"
else
    echo -e "${YELLOW}⚠️  .env.development already exists, skipping...${NC}"
fi

echo ""
echo -e "${BLUE}📋 Environment Variables to Configure${NC}"
echo "======================================"
echo ""
echo "Edit .env.development with your local settings:"
echo ""
echo "1. DATABASE_URL"
echo "   - Local PostgreSQL: postgresql://postgres:postgres@localhost:5432/inchat_dev"
echo "   - Docker: postgresql://postgres:postgres@postgres:5432/inchat_dev"
echo ""
echo "2. JWT_SECRET"
echo "   - Use any string (min 32 chars): dev-secret-min-32-chars-long-string"
echo ""
echo "3. REDIS_URL (Optional)"
echo "   - Local: redis://localhost:6379"
echo "   - Docker: redis://redis:6379"
echo ""
echo "4. NEXT_PUBLIC_API_URL"
echo "   - Local: http://localhost:3000"
echo ""
echo "5. NEXT_PUBLIC_SOCKET_IO_URL"
echo "   - Local: http://localhost:3000"
echo ""

# Ask if user wants to open .env.development
read -p "Do you want to open .env.development now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code .env.development
    elif command -v vim &> /dev/null; then
        vim .env.development
    elif command -v nano &> /dev/null; then
        nano .env.development
    else
        echo -e "${YELLOW}Please open .env.development with your editor${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📦 Installing Dependencies${NC}"
echo "============================="
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules already exists${NC}"
fi

echo ""
echo -e "${BLUE}🗄️  Setting Up Database${NC}"
echo "======================="
read -p "Do you want to set up the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing schema to database..."
    npm run db:push
    echo -e "${GREEN}✅ Database schema pushed${NC}"
    
    echo ""
    read -p "Do you want to seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        echo -e "${GREEN}✅ Database seeded${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env.development with your database credentials"
echo "2. Start development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more info, see:"
echo "- QUICK_SETUP.md - Quick reference guide"
echo "- ENVIRONMENT_SETUP.md - Detailed multi-environment guide"
echo "- README.md - Full documentation"
