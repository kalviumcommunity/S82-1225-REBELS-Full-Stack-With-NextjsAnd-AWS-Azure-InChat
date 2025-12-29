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
| `npm start` | Start production server |
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
| `REDIS_URL` | Redis connection string | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

## Development Tips

- Use `npm run db:studio` to visually manage database
- Check logs in browser DevTools Console for Socket.IO events
- Use Prisma extension in VS Code for schema highlighting
- Run `npm run lint` before committing code

## Performance Optimizations

- Redis adapter prevents duplicate messages across servers
- Indexed database fields for faster queries
- Normalized schema prevents data duplication
- Socket.IO rooms reduce message broadcast scope

## Troubleshooting

**Can't connect to database?**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Run `npm run db:push` to sync schema

**WebSocket connection failing?**
- Check browser Network tab for `/socket.io` requests
- Ensure `REDIS_URL` is set if using Redis
- Verify Socket.IO configuration in server setup

**Build errors?**
- Run `npm install` to ensure dependencies
- Delete `node_modules` and `.next` folders
- Run `npm run db:push` to sync database schema

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback, please open an issue on the repository.

