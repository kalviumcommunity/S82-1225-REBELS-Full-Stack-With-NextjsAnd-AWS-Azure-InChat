# Inchat

Inchat is a **WhatsApp-like one-to-one realtime chat** app built with modern full-stack technologies. Send and receive messages in real-time with secure authentication and scalable architecture.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | Full-stack React framework with TypeScript |
| **Prisma** | Type-safe ORM for database operations |
| **PostgreSQL** | Relational database |
| **Socket.IO** | Real-time bidirectional communication |
| **Redis** | Caching and Socket.IO adapter (optional) |
| **TailwindCSS** | Utility-first CSS framework |
| **Docker** | Containerization for local development |

## Features

✅ **Real-time Messaging** - Instant message delivery via Socket.IO  
✅ **Secure Authentication** - JWT tokens + bcrypt password hashing  
✅ **User Management** - Create accounts, login, and manage profiles  
✅ **Chat Persistence** - All conversations stored in PostgreSQL  
✅ **Scalable Architecture** - Redis adapter for horizontal scaling  
✅ **Type-Safe** - Full TypeScript support throughout  
✅ **Modern UI** - Responsive design with TailwindCSS  

## What's Included

- **Normalized Schema**: Users, Chats, ChatParticipants, DirectChat, Messages with constraints & indexes
- **Secure Auth**: bcrypt password hashing + JWT in httpOnly cookies
- **Real-time Messaging**: Socket.IO with per-chat rooms and cookie authentication
- **Optional Scaling**: Redis adapter enabled when `REDIS_URL` is set
- **Dockerized Dev**: Full stack (app + postgres + redis) via Docker Compose

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes & WebSocket handlers
│   │   ├── auth/         # Authentication endpoints
│   │   ├── chats/        # Chat management
│   │   └── users/        # User management
│   ├── chats/            # Chat UI pages
│   └── login/signup/     # Auth pages
├── lib/                   # Utility functions & configs
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database client
│   ├── session.ts        # Session management
│   ├── password.ts       # Password utilities
│   └── socket-client.ts  # Socket.IO client
prisma/
├── schema.prisma         # Database schema
├── seed.ts               # Database seeding
└── migrations/           # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use Docker)
- Redis (optional, for scaling)
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Inchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/inchat"
   
   # JWT Secret (generate a random string)
   JWT_SECRET="your-secret-key-here"
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   ```

4. **Setup database**
   ```bash
   npm run db:push          # Push schema to database
   npm run db:seed          # Seed initial data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build Next.js and Node.js server |
| `npm run build:staging` | Build for staging environment |
| `npm run build:production` | Build for production environment |
| `npm start` | Start production server |
| `npm run start:staging` | Start staging server |
| `npm run start:production` | Start production server |
| `npm run lint` | Run ESLint code validation |
| `npm run db:migrate` | Create database migration |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio for database inspection |
| `npm run db:push` | Sync schema with database (no migrations) |
| `npm run db:reset` | Reset database (deletes all data) |

## Docker Setup

Run the entire stack locally with Docker:

```bash
docker-compose up
```

This starts:
- Next.js app on `http://localhost:3000`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379` (optional)

## Authentication Flow

1. User signs up with email & password
2. Password hashed with bcrypt and stored in database
3. Login returns JWT token in httpOnly cookie
4. Token validated on protected routes
5. WebSocket connections authenticated via cookie

## Real-time Features

- Socket.IO creates a room per chat
- Messages broadcast to all participants in the room
- Presence indicators for online status
- Redis adapter for multi-server scaling

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout (clear cookie)
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[chatId]` - Get chat details
- `GET /api/chats/[chatId]/messages` - Get messages

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `NEXT_PUBLIC_API_URL` | Frontend API endpoint (public) | ✅ |
| `NEXT_PUBLIC_SOCKET_IO_URL` | WebSocket endpoint (public) | ✅ |
| `REDIS_URL` | Redis connection string | ❌ |
| `NODE_ENV` | Environment (development/production) | ✅ |

## Environment-Aware Builds & Secrets Management

### Multi-Environment Setup

This project supports separate configurations for **development**, **staging**, and **production** environments.

#### Environment Files

- **`.env.example`** - Template file (tracked in git) showing all required variables
- **`.env.development`** - Local development configuration (NOT tracked)
- **`.env.staging`** - Staging environment configuration (NOT tracked)
- **`.env.production`** - Production environment configuration (NOT tracked)

#### Build Commands

```bash
# Development (uses .env.development)
npm run dev

# Staging build
npm run build:staging
npm run start:staging

# Production build
npm run build:production
npm run start:production
```

### Secrets Management

**Never hardcode secrets** in your code or configuration files. Instead, use secure management:

#### Option 1: GitHub Secrets (Recommended for GitHub Actions)

Store sensitive values in `Settings → Secrets and variables → Actions`:

```
STAGING_DB_PASSWORD
STAGING_JWT_SECRET
STAGING_REDIS_PASSWORD
PROD_DB_PASSWORD
PROD_JWT_SECRET
PROD_REDIS_PASSWORD
```

#### Option 2: AWS Parameter Store

```bash
aws ssm put-parameter --name "inchat/prod/db-password" --value "secret" --type "SecureString"
```

#### Option 3: Azure Key Vault

```bash
az keyvault secret set --vault-name inchat-vault --name "prod-db-password" --value "secret"
```

### CI/CD Pipeline

GitHub Actions automatically builds and deploys when you push to:

- **`develop` branch** → Staging deployment
- **`main` branch** → Production deployment

The workflow:
1. Checks out code
2. Installs dependencies
3. Runs linting and tests
4. Creates environment file with secrets from GitHub Secrets
5. Builds for the target environment
6. Deploys to staging or production
7. Sends notifications

See [`.github/workflows/build-and-deploy.yml`](.github/workflows/build-and-deploy.yml) for details.

### Security Best Practices

✅ **DO**
- Store secrets in GitHub Secrets, AWS Parameter Store, or Azure Key Vault
- Use environment-specific secrets for each environment
- Keep `.env.example` tracked and updated
- Rotate secrets regularly (quarterly minimum)
- Use strong, unique secrets (min 32 characters)
- Audit who has access to production secrets

❌ **DON'T**
- Hardcode secrets in code or `.env` files
- Commit `.env.development`, `.env.staging`, or `.env.production`
- Share secrets via email or chat
- Use the same secret across environments
- Push secrets to version control history

### Environment-Specific Configuration

#### Development
- Uses `localhost` for all services
- Debug mode enabled
- Verbose logging
- Hot reload enabled

#### Staging
- Points to staging infrastructure (AWS RDS, Azure Database, etc.)
- Production-like environment
- Moderate logging
- For testing before production

#### Production
- Points to production infrastructure
- Minimal logging (warnings only)
- Maximum security
- All secrets from secure stores
- Health checks and monitoring

### Comprehensive Secrets Documentation

For detailed setup instructions, environment variables for each stage, and troubleshooting, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

This guide includes:
- Step-by-step GitHub Secrets setup
- AWS Parameter Store integration
- Azure Key Vault integration
- Secret rotation procedures
- CI/CD pipeline configuration
- Troubleshooting common issues

## Development Tips

- Use `npm run db:studio` to visually manage database
- Check logs in browser DevTools Console for Socket.IO events
- Use Prisma extension in VS Code for schema highlighting
- Run `npm run lint` before committing code
- Always use environment-specific builds for deployments

## Performance Optimizations

- Redis adapter prevents duplicate messages across servers
- Indexed database fields for faster queries
- Normalized schema prevents data duplication
- Socket.IO rooms reduce message broadcast scope
- Separate staging/production prevents accidental data issues

## Troubleshooting

**Can't connect to database?**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in correct `.env` file
- Run `npm run db:push` to sync schema

**Build failing with undefined variables?**
- Check if all required environment variables are set
- Verify GitHub Secrets are created with correct names
- Ensure `.env` file exists for the target environment

**WebSocket connection failing?**
- Check browser Network tab for `/socket.io` requests
- Ensure `NEXT_PUBLIC_SOCKET_IO_URL` is correct
- Verify Socket.IO configuration in server setup
- Check if REDIS_URL is set for production

**Secrets not updating after change?**
- GitHub Secrets are cached during workflow
- Trigger a new deployment after updating secrets
- Wait for previous deployment to complete first

**Build errors?**
- Run `npm install` to ensure dependencies
- Delete `node_modules` and `.next` folders
- Run `npm run db:push` to sync database schema
- Check Node.js version matches requirement (18+)

## Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure

### Containerization with Docker

This project uses Docker to containerize the full-stack application, ensuring consistent environments across development, testing, and production. The setup includes:

**Dockerfile** - Multi-stage build for optimized production images:
```dockerfile
FROM node:20-alpine AS base
# ... deps and builder stages for efficient caching
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

**Docker Compose** - Local development environment with PostgreSQL and Redis:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/inchat
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
```

To run locally with Docker: `docker-compose up`

### CI/CD with GitHub Actions

The project uses GitHub Actions for automated testing, building, and deployment. The pipeline includes:

- **Automated Testing**: Runs on every push/PR with PostgreSQL and Redis services
- **Linting**: Ensures code quality with ESLint
- **Docker Build**: Creates optimized container images
- **Security**: Uses GitHub Secrets for sensitive configuration

Key workflow features:
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
      redis:
        image: redis:7-alpine
```

### Cloud Deployment (AWS/Azure)

The application is designed for deployment on cloud platforms with the following architecture:

**Infrastructure Components:**
- **Application Server**: Containerized Next.js app with Socket.IO
- **Database**: PostgreSQL (managed service like RDS or Azure Database)
- **Cache**: Redis (managed service like ElastiCache or Azure Cache)
- **Storage**: Static assets on S3 or Azure Blob Storage

**Environment Configuration:**
- Secrets managed via AWS Parameter Store or Azure Key Vault
- Environment-specific builds (staging/production)
- Health checks and monitoring integration

**Deployment Process:**
1. Code changes trigger CI/CD pipeline
2. Tests run in isolated environment
3. Docker image built and pushed to registry
4. Infrastructure updated with new container
5. Database migrations applied automatically
6. Health checks verify deployment success

### Security & Best Practices

- **Environment Variables**: Sensitive data never committed to code
- **Secret Management**: Cloud-native key management services
- **Network Security**: Proper VPC/subnet configuration
- **Monitoring**: Application logs and metrics collection
- **Backup**: Automated database backups and recovery

### Challenges & Learnings

**What worked well:**
- Docker simplified environment consistency across dev/staging/prod
- GitHub Actions provided reliable automation
- Multi-stage Docker builds reduced image size significantly

**Challenges faced:**
- Configuring Socket.IO with container networking required careful environment setup
- Database migrations in CI/CD needed proper service dependencies
- Managing secrets across multiple environments required careful planning

**Improvements for next deployment:**
- Add comprehensive test coverage before deployment
- Implement blue-green deployment strategy for zero-downtime updates
- Add automated performance testing in CI pipeline
- Consider using infrastructure-as-code tools like Terraform for reproducible environments

For detailed deployment guides, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Create `.env.development` from `.env.example` and configure locally
3. Test locally with `npm run dev`
4. Commit changes: `git commit -m "Add your feature"`
5. Push to branch: `git push origin feature/your-feature`
6. Open a Pull Request
7. CI/CD will automatically test and build

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback, please open an issue on the repository.

