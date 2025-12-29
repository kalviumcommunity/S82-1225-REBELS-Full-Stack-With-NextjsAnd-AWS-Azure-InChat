# Quick Setup Guide - Multi-Environment Deployment

## TL;DR - Quick Start

### 1. Local Development (30 seconds)
```bash
cp .env.example .env.development
# Edit .env.development with localhost values
npm run dev
```

### 2. Create GitHub Secrets (2 minutes)

Go to `Settings → Secrets and variables → Actions` and create:

**Staging Secrets:**
```
STAGING_DB_PASSWORD=your-staging-db-password
STAGING_JWT_SECRET=your-staging-jwt-secret-min-32-chars
STAGING_REDIS_PASSWORD=your-staging-redis-password
STAGING_API_URL=https://staging-api.inchat.example.com
STAGING_SOCKET_IO_URL=https://staging-api.inchat.example.com
```

**Production Secrets:**
```
PROD_DB_PASSWORD=your-production-db-password
PROD_JWT_SECRET=your-production-jwt-secret-min-32-chars
PROD_REDIS_PASSWORD=your-production-redis-password
PROD_API_URL=https://api.inchat.example.com
PROD_SOCKET_IO_URL=https://api.inchat.example.com
PROD_ANALYTICS_ID=your-analytics-id
```

### 3. Push & Deploy (1 minute)

```bash
# Staging (pushes to develop branch)
git push origin develop
# → GitHub Actions builds .env.staging with secrets and deploys

# Production (pushes to main branch)
git push origin main
# → GitHub Actions builds .env.production with secrets and deploys
```

---

## File Structure Overview

```
Inchat/
├── .env.example           ← Template (TRACKED in git)
├── .env.development       ← Local dev (NOT tracked - add to .gitignore ✅)
├── .env.staging           ← Staging secrets (NOT tracked - add to .gitignore ✅)
├── .env.production        ← Prod secrets (NOT tracked - add to .gitignore ✅)
├── .github/
│   └── workflows/
│       └── build-and-deploy.yml    ← CI/CD pipeline
├── ENVIRONMENT_SETUP.md   ← Detailed guide
└── README.md              ← This file
```

---

## Environment Variables Reference

### Database & Auth (SECRET - Never hardcode)
```env
DATABASE_URL=postgresql://user:${PASSWORD}@host:5432/dbname
JWT_SECRET=${YOUR_32_CHAR_SECRET}
REDIS_URL=redis://:${PASSWORD}@host:6379
```

### Public URLs (Safe to expose)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SOCKET_IO_URL=https://api.example.com
```

### Environment Markers
```env
NODE_ENV=development|production
ENVIRONMENT=development|staging|production
```

---

## Build Commands

| Command | Environment | Use Case |
|---------|-------------|----------|
| `npm run dev` | development | Local development with hot reload |
| `npm run build:staging` | staging | Production build with staging config |
| `npm run build:production` | production | Production build with prod config |

---

## Deployment Flow

### Automatic Deployment (GitHub Actions)

```
Your Code
    ↓
git push origin develop (or main)
    ↓
GitHub Actions Triggered
    ↓
Load Secrets from GitHub Secrets
    ↓
Create .env file with secrets
    ↓
Build (npm run build:staging/production)
    ↓
Deploy to Staging/Production
    ↓
Notify Slack (if configured)
```

---

## Security Checklist

Before deploying:

- [ ] All sensitive values in GitHub Secrets (not in `.env.production`)
- [ ] `.env.development`, `.env.staging`, `.env.production` in `.gitignore`
- [ ] `.env.example` has NO real secrets
- [ ] Database passwords are 20+ characters
- [ ] JWT_SECRET is 32+ characters
- [ ] Different secrets for staging and production
- [ ] GitHub Secrets are properly named
- [ ] `.gitignore` checked with `git check-ignore -v .env.staging`

---

## Common Tasks

### Add a New Secret

1. Generate secure value:
   ```bash
   # Linux/Mac
   openssl rand -base64 32
   
   # Windows PowerShell
   [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random))) | Select-Object -First 32
   ```

2. Add to GitHub Secrets: `Settings → Secrets → New secret`

3. Reference in `.github/workflows/build-and-deploy.yml`:
   ```yaml
   - name: Create Environment File
     run: |
       echo "MY_NEW_SECRET=${{ secrets.MY_NEW_SECRET }}" >> .env.staging
   ```

### Update .env Files

```bash
# Update .env.development (local)
# Just edit the file directly

# Update .env.staging (GitHub Actions)
# 1. Update GitHub Secrets
# 2. Push to develop branch
# 3. Workflow auto-creates .env.staging with new values

# Update .env.production (GitHub Actions)
# 1. Update GitHub Secrets
# 2. Push to main branch
# 3. Workflow auto-creates .env.production with new values
```

### Rotate Secrets

```bash
# 1. Generate new secret value
openssl rand -base64 32

# 2. Update GitHub Secret
# Settings → Secrets → Click secret → Update value

# 3. Trigger new deployment
git commit --allow-empty -m "Rotate secrets"
git push

# 4. Monitor deployment
# Actions tab → See new build with rotated secrets
```

### Debug Environment Variables

```bash
# Show what env vars are loaded
npm run dev

# Check GitHub Actions logs
# Actions tab → Click workflow run → See environment file creation step
```

---

## Troubleshooting

### "DATABASE_URL is undefined"
1. Check `.env.staging` or `.env.production` exists
2. Verify GitHub Secrets are created with exact names
3. Look at GitHub Actions logs for secret loading step
4. Check workflow file is creating `.env` file correctly

### "Build failed in production"
1. Check GitHub Actions logs
2. Verify all required secrets are set
3. Ensure staging build passes before pushing to main
4. Roll back with `git revert` if needed

### "Secrets still using old value"
1. GitHub caches secrets during workflow run
2. Trigger new deployment after updating secret
3. Use `git commit --allow-empty` to trigger build

### "Local env vars not loading"
1. Check `.env.development` file exists
2. Verify you're running `npm run dev` (not `npm run build`)
3. Restart dev server
4. Check file path: `pwd` should show project root

### "Can't push to main branch"
1. Make sure you have branch protection rules
2. Create PR to main from develop first
3. Get approval if required
4. Merge PR (triggers production build)

---

## Resources

- **Full Documentation**: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- **CI/CD Workflow**: [.github/workflows/build-and-deploy.yml](.github/workflows/build-and-deploy.yml)
- **Environment Template**: [.env.example](.env.example)
- **GitHub Secrets Docs**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Next.js Env Vars**: https://nextjs.org/docs/basic-features/environment-variables

---

## Support

For issues:
1. Check [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) troubleshooting section
2. Review GitHub Actions logs in `Actions` tab
3. Run `git check-ignore -v .env.*` to verify .gitignore
4. Ensure all GitHub Secrets match expected variable names
