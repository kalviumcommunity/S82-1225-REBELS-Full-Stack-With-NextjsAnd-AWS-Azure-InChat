# Inchat

Inchat is a **WhatsApp-like one-to-one realtime chat** app built with **Next.js (TypeScript)**, **Prisma**, **PostgreSQL**, and **Socket.IO**.

## Whats included

- Normalized schema: Users, Chats, ChatParticipants, DirectChat, Messages (constraints + indexes)
- Secure auth: bcrypt password hashing + JWT in an httpOnly cookie
- Realtime messaging: Socket.IO rooms per chat (cookie-authenticated)
- Optional scaling: Redis adapter enabled when `REDIS_URL` is set
- Dockerized local dev: app + postgres + redis via Docker Compose

## Environment variables

- Repo root: `.env` is used by Docker Compose
- App template: `student-app/.env.example`

Never hardcode secrets in source code.

## Local development (Docker)

1) Start Docker Desktop
2) From repo root:

- `docker compose up --build`

Open `http://localhost:3000`

## Local development (no Docker)

From `student-app/`:

- `npm install`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run dev`

## Git workflow

Use feature branches + PRs:

- `feature/<name>`
- `fix/<name>`
- `chore/<name>`
