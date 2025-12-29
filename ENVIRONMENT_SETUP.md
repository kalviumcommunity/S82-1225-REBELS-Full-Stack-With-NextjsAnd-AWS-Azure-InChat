# Environment-Aware Builds & Secrets Management Guide

## Overview

This guide explains how to set up secure multi-environment deployments for the Inchat project. It covers configuration management across development, staging, and production environments with proper secrets handling.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [GitHub Secrets Setup](#github-secrets-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Build & Deployment](#build--deployment)
5. [Secrets Management Best Practices](#secrets-management-best-practices)
6. [AWS & Azure Integration](#aws--azure-integration)
7. [Troubleshooting](#troubleshooting)

---

## Environment Configuration

### Environment Files Structure

The project uses separate environment files for each deployment environment:

```
.env.example       # Template with all required variables (TRACKED)
.env.development   # Local development (NOT tracked - add to .gitignore)
.env.staging       # Staging environment secrets (NOT tracked - add to .gitignore)
.env.production    # Production environment secrets (NOT tracked - add to .gitignore)
```

### File Purposes

#### `.env.example` (Tracked in Git)
```bash
# Template showing all required environment variables
# Contains no real secrets, only placeholders
# Helps team members know what variables are needed
```

#### `.env.development` (NOT Tracked)
```bash
# Local development configuration
# Uses localhost for all services
# Can be safely shared within team
# Example: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inchat_dev"
```

#### `.env.staging` (NOT Tracked)
```bash
# Staging environment configuration
# Points to staging infrastructure (AWS, Azure, etc.)
# Contains references to GitHub Secrets for sensitive data
# Example: DATABASE_URL="postgresql://user:${STAGING_DB_PASSWORD}@staging-db.com/inchat"
```

#### `.env.production` (NOT Tracked)
```bash
# Production environment configuration
# **NEVER hardcoded secrets here**
# All secrets loaded from GitHub Secrets/AWS Parameter Store/Azure Key Vault
# Example: DATABASE_URL="postgresql://user:${PROD_DB_PASSWORD}@prod-db.com/inchat"
```

### Critical Variables

| Variable | Type | Environment | Description |
|----------|------|-------------|-------------|
| `DATABASE_URL` | Secret | All | PostgreSQL connection string |
| `JWT_SECRET` | Secret | All | JWT token signing key |
| `REDIS_URL` | Secret | Staging/Prod | Redis connection string |
| `NEXT_PUBLIC_API_URL` | Public | All | Frontend API endpoint |
| `NEXT_PUBLIC_SOCKET_IO_URL` | Public | All | WebSocket endpoint |
| `NODE_ENV` | Config | All | Environment type (development/production) |

---

## GitHub Secrets Setup

### Step 1: Create Repository Secrets

1. Go to your GitHub repository: `Settings` → `Secrets and variables` → `Actions`
2. Click **New repository secret**
3. Create the following secrets:

#### Staging Secrets
```
STAGING_DB_PASSWORD       → your-staging-db-password
STAGING_JWT_SECRET        → your-staging-jwt-secret-min-32-chars
STAGING_REDIS_PASSWORD    → your-staging-redis-password
STAGING_API_URL           → https://staging-api.inchat.example.com
STAGING_SOCKET_IO_URL     → https://staging-api.inchat.example.com
```

#### Production Secrets
```
PROD_DB_PASSWORD          → your-production-db-password
PROD_JWT_SECRET           → your-production-jwt-secret-min-32-chars
PROD_REDIS_PASSWORD       → your-production-redis-password
PROD_API_URL              → https://api.inchat.example.com
PROD_SOCKET_IO_URL        → https://api.inchat.example.com
PROD_ANALYTICS_ID         → your-analytics-id
```

### Step 2: Verify Secrets

```bash
# List all secrets (you won't see values, just names)
# Via GitHub CLI:
gh secret list --repo your-username/inchat
```

### Step 3: Access Secrets in GitHub Actions

In your workflow file (`.github/workflows/deploy.yml`):

```yaml
env:
  DATABASE_URL: postgresql://user:${{ secrets.STAGING_DB_PASSWORD }}@db.com/inchat
  JWT_SECRET: ${{ secrets.STAGING_JWT_SECRET }}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/build-and-deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches:
      - develop  # triggers staging build
      - main     # triggers production build
  pull_request:
    branches:
      - develop
      - main

jobs:
  # === STAGING BUILD ===
  build-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Create Staging .env
        run: |
          echo "DATABASE_URL=postgresql://user:${{ secrets.STAGING_DB_PASSWORD }}@staging-db.com:5432/inchat" > .env.staging
          echo "JWT_SECRET=${{ secrets.STAGING_JWT_SECRET }}" >> .env.staging
          echo "REDIS_URL=redis://:${{ secrets.STAGING_REDIS_PASSWORD }}@staging-redis.com:6379" >> .env.staging
          echo "NEXT_PUBLIC_API_URL=${{ secrets.STAGING_API_URL }}" >> .env.staging
          echo "NEXT_PUBLIC_SOCKET_IO_URL=${{ secrets.STAGING_SOCKET_IO_URL }}" >> .env.staging
          echo "NODE_ENV=production" >> .env.staging
      
      - name: Build for Staging
        run: npm run build:staging
      
      - name: Run Tests
        run: npm run lint
      
      - name: Deploy to Staging
        run: |
          # Add your deployment script here
          # Example: docker build -t inchat:staging . && docker push your-registry/inchat:staging
          echo "Deploying to staging..."

  # === PRODUCTION BUILD ===
  build-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Create Production .env
        run: |
          echo "DATABASE_URL=postgresql://user:${{ secrets.PROD_DB_PASSWORD }}@prod-db.com:5432/inchat" > .env.production
          echo "JWT_SECRET=${{ secrets.PROD_JWT_SECRET }}" >> .env.production
          echo "REDIS_URL=redis://:${{ secrets.PROD_REDIS_PASSWORD }}@prod-redis.com:6379" >> .env.production
          echo "NEXT_PUBLIC_API_URL=${{ secrets.PROD_API_URL }}" >> .env.production
          echo "NEXT_PUBLIC_SOCKET_IO_URL=${{ secrets.PROD_SOCKET_IO_URL }}" >> .env.production
          echo "NODE_ENV=production" >> .env.production
      
      - name: Build for Production
        run: npm run build:production
      
      - name: Run Tests
        run: npm run lint
      
      - name: Deploy to Production
        run: |
          # Add your deployment script here
          # Example: docker build -t inchat:latest . && docker push your-registry/inchat:latest
          echo "Deploying to production..."
```

---

## Build & Deployment

### Local Development Build

```bash
# Uses .env.development
npm run dev
```

### Staging Build

```bash
# Creates a production build with staging configuration
npm run build:staging

# Start staging server
npm run start:staging
```

### Production Build

```bash
# Creates a production build with production configuration
npm run build:production

# Start production server
npm run start:production
```

### Build Process

1. **Load Environment Variables**
   ```bash
   NODE_ENV=production next build
   ```

2. **Compile TypeScript**
   ```bash
   npm run build:server
   ```

3. **Output Structure**
   ```
   .next/          # Next.js compiled code
   dist/           # Node.js server compiled code
   ```

---

## Secrets Management Best Practices

### ✅ DO

- ✅ Use GitHub Secrets for sensitive values
- ✅ Reference secrets in CI/CD pipelines only
- ✅ Rotate secrets regularly (quarterly minimum)
- ✅ Use strong, unique secrets for each environment
- ✅ Document secret names in team wiki
- ✅ Audit access to secrets
- ✅ Use separate secrets for staging and production
- ✅ Never commit `.env*` files except `.env.example`

### ❌ DON'T

- ❌ Hardcode secrets in code or config files
- ❌ Commit `.env.development`, `.env.staging`, or `.env.production`
- ❌ Share secrets via email or chat
- ❌ Use same secret for multiple environments
- ❌ Store secrets in version control history
- ❌ Log or print secret values
- ❌ Use weak or simple passwords
- ❌ Give all team members access to production secrets

### Secret Rotation

```bash
# When rotating a secret:
# 1. Generate new secret value
# 2. Update GitHub Secrets
# 3. Trigger new deployment
# 4. Verify deployment works
# 5. Document change in team wiki
# 6. Remove old secret
```

---

## AWS & Azure Integration

### Option 1: AWS Parameter Store

#### Store Secrets
```bash
aws ssm put-parameter \
  --name "inchat/staging/db-password" \
  --value "your-db-password" \
  --type "SecureString" \
  --region us-east-1

aws ssm put-parameter \
  --name "inchat/production/db-password" \
  --value "your-db-password" \
  --type "SecureString" \
  --region us-east-1
```

#### Retrieve Secrets in CI/CD
```bash
# GitHub Actions workflow
- name: Load AWS Secrets
  run: |
    DB_PASSWORD=$(aws ssm get-parameter \
      --name "inchat/staging/db-password" \
      --with-decryption \
      --query 'Parameter.Value' \
      --output text \
      --region us-east-1)
    echo "DATABASE_PASSWORD=$DB_PASSWORD" >> .env.staging
```

### Option 2: Azure Key Vault

#### Store Secrets
```bash
az keyvault secret set \
  --vault-name inchat-vault \
  --name "staging-db-password" \
  --value "your-db-password"

az keyvault secret set \
  --vault-name inchat-vault \
  --name "production-db-password" \
  --value "your-db-password"
```

#### Retrieve Secrets in CI/CD
```bash
# GitHub Actions workflow
- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Load Azure Secrets
  run: |
    DB_PASSWORD=$(az keyvault secret show \
      --vault-name inchat-vault \
      --name "staging-db-password" \
      --query value -o tsv)
    echo "DATABASE_PASSWORD=$DB_PASSWORD" >> .env.staging
```

---

## Troubleshooting

### Build Failing with "Undefined Variable"

**Problem**: Environment variable not found during build

**Solution**:
1. Check if variable is in `.env.staging` or `.env.production`
2. Verify GitHub Secret is created and named correctly
3. Confirm GitHub Actions step creates `.env` file
4. Check if Next.js build step loads the correct file

```bash
# Debug: Print what variables are loaded
echo "DATABASE_URL: $DATABASE_URL"
echo "JWT_SECRET: ${JWT_SECRET:0:10}..." # Don't print full secret
```

### Secret Not Updated After Changing GitHub Secret

**Problem**: Deployment still uses old secret value

**Solution**:
1. GitHub Secrets are cached during workflow
2. Trigger new deployment to refresh secrets
3. Wait for previous deployment to finish

```bash
# Force new deployment
git commit --allow-empty -m "Trigger new deployment"
git push
```

### .env File Accidentally Committed

**Problem**: Sensitive data exposed in git history

**Solution**:
```bash
# Remove file from git history (requires force push)
git rm --cached .env.staging
git commit --amend

# Or use BFG to clean history:
bfg --delete-files .env.staging

# Regenerate all secrets
```

### Local Development Environment Variables Not Loading

**Problem**: `.env.development` not being read

**Solution**:
```bash
# Verify .env.development exists
ls -la .env.development

# Check Next.js is loading the file
# Next.js loads in this order:
# 1. .env.development.local
# 2. .env.development
# 3. .env.local
# 4. .env

# For development with specific env:
NODE_ENV=development npm run dev
```

### Can't See Secret Values in GitHub

**Problem**: GitHub hides secret values for security

**Solution**:
1. Secrets are masked in logs automatically
2. Use GitHub CLI to verify secret exists:
   ```bash
   gh secret list --repo your-username/inchat
   ```
3. Create new secret if unsure

---

## Security Checklist

- [ ] All `.env*` files (except `.env.example`) are in `.gitignore`
- [ ] GitHub Secrets created for all sensitive variables
- [ ] Staging and production secrets are different
- [ ] Build scripts reference secrets from GitHub Actions
- [ ] `.env.example` contains no real secrets, only templates
- [ ] Team members know which secrets they have access to
- [ ] Secrets are rotated quarterly
- [ ] Production secrets have restricted access
- [ ] Build logs don't print secrets (auto-masked by GitHub)
- [ ] `.gitignore` verified with `git check-ignore`

---

## Quick Reference

### Create Local Environment
```bash
cp .env.example .env.development
# Edit .env.development with local values
```

### Verify .gitignore
```bash
# Check if .env.staging is ignored
git check-ignore -v .env.staging
# Output: .gitignore:27:.env*
```

### Create GitHub Secret
```bash
gh secret set STAGING_DB_PASSWORD -b "your-password" --repo your-username/inchat
```

### Build for Environment
```bash
# Staging
npm run build:staging

# Production
npm run build:production
```

---

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS Parameter Store Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [Azure Key Vault Documentation](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)
