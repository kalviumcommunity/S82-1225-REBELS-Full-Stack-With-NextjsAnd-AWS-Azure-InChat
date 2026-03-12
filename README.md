# InChat

A WhatsApp-like chat app built with Next.js (App Router), MongoDB + Mongoose and Socket.IO for realtime messaging.

## Purpose
Provide a clear folder and routing structure for building an app with: auth flow, chat UI (conversations and threads), shared components, and API route placeholders.

## Key folders
- `app/` — App Router routes and layouts
  - `app/layout.tsx` — Root HTML layout
  - `app/page.tsx` — Landing page
  - `app/(auth)/` — Auth route group
    - `sign-in/page.tsx`, `sign-up/page.tsx`
  - `app/chat/` — Chat root
    - `page.tsx` — Conversations list
    - `[id]/page.tsx` — Conversation thread
  - `app/api/` — Route handlers
    - `api/auth/*` — auth endpoints (placeholders)
    - `api/chat/*` — chat endpoints (placeholders)

- `components/` — Shared UI components (`Header`, `ChatList`, `Message`, `Avatar`)
- `lib/` — Types and helpers

## Getting started
1. Ensure you have a Next.js project with React 18+ and App Router enabled.
2. Install dependencies and run the dev server:

```bash
# PowerShell
npm install
npm run dev
```

## Next steps / suggestions
- Wire auth routes to an auth provider (NextAuth, Clerk, Supabase) or custom JWT sessions.
- Add a database (Prisma, PlanetScale) and implement persistence for conversations and messages.
- Replace inline styles with Tailwind / CSS Modules / Stitches for consistent design.
- Add tests (Playwright for e2e, Jest for unit tests).

- Real-time: a Socket.IO server is included under `server/socket.js` for local real-time messaging. Start it with `npm run socket-server` after installing dependencies. The server supports JWT-based auth (pass token via `socket.auth.token`) and emits/receives `private_message` events. Use `NEXT_PUBLIC_SOCKET_URL` to point the client to the socket server.

## Notes
- Parentheses in folder names (e.g., `(auth)`) are used for route groups and won't appear in the route path.

---

This scaffold is intentionally minimal — extend each file with real logic, authentication, and database integration as needed.

---

## 🐳 Docker & docker-compose (example)

This repo includes a production-friendly `Dockerfile` and a `docker-compose.yml` that can run the Next.js web app, the standalone Socket.IO server, and local MongoDB/Redis for development.

Quick steps:

1. Copy `.env.example` → `.env` and set valid values (especially `JWT_SECRET`).
2. Build & run:

```bash
# Build and start services (in background)
docker-compose up --build -d

# Tail logs
docker-compose logs -f
```

3. The app will be available at `http://localhost:3000` and Socket server at `http://localhost:4000` (when using the example compose file).

Notes:
- The example `docker-compose.yml` sets `MONGODB_URI` to `mongodb://mongo:27017/inchat` for services inside the compose network — replace these values or add an external `MONGODB_URI` in your `.env` for production.
- **Important:** Replace `JWT_SECRET=replace_me` in `docker-compose.yml` or set the value via environment variable / secrets for production use. Use a long random secret (e.g., `openssl rand -hex 32`).
- For production scaling, use the Redis adapter for Socket.IO and run multiple `socket` service instances behind a load balancer.

