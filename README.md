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

---

# PostgreSQL Schema Design (Assignment)

This project uses Prisma ORM with PostgreSQL. The relational model is defined in [student-app/prisma/schema.prisma](student-app/prisma/schema.prisma).

## Core entities

- **User**: registered account (email, display name, password hash).
- **Chat**: conversation container (currently `DIRECT` only).
- **ChatParticipant**: join table between `User` and `Chat` (many-to-many) with participation metadata (`joinedAt`, `lastReadAt`).
- **DirectChat**: 1:1 mapping that enforces *exactly one* direct chat between two users.
- **Message**: message content sent by a user inside a chat.

## Relationships (ER-style overview)

- `User (1) -> (N) Message` via `Message.senderId`
- `Chat (1) -> (N) Message` via `Message.chatId`
- `User (N) <-> (N) Chat` via `ChatParticipant(chatId, userId)`
- `Chat (1) -> (0..1) DirectChat` via `DirectChat.chatId`
- `DirectChat` references exactly two users (`user1Id`, `user2Id`)

## Keys, constraints, and deletes

Primary keys (PK):
- `User.id`, `Chat.id`, `Message.id` are UUIDs.
- `DirectChat.chatId` is also the PK and FK to `Chat.id`.
- `ChatParticipant` uses a composite PK: `@@id([chatId, userId])`.

Foreign keys (FK) and cascading deletes:
- `Message.chatId -> Chat.id` (`onDelete: Cascade`)
- `Message.senderId -> User.id` (`onDelete: Cascade`)
- `ChatParticipant.chatId -> Chat.id` (`onDelete: Cascade`)
- `ChatParticipant.userId -> User.id` (`onDelete: Cascade`)
- `DirectChat.chatId -> Chat.id` (`onDelete: Cascade`)
- `DirectChat.user1Id -> User.id` (`onDelete: Cascade`)
- `DirectChat.user2Id -> User.id` (`onDelete: Cascade`)

Uniqueness:
- `User.email` is unique.
- `DirectChat` enforces one direct chat per user pair with `@@unique([user1Id, user2Id])`.
	- App code stores user IDs in stable sorted order so `(A,B)` and `(B,A)` cannot both exist.

## Indexes (performance)

Defined in the Prisma schema for common query patterns:
- `User`: `@@index([createdAt])` for sorting/recent user listing.
- `Chat`: `@@index([updatedAt])` for recent chats.
- `ChatParticipant`: indexes on `userId` and `chatId` for fast membership lookup.
- `DirectChat`: indexes on `user1Id` and `user2Id` for lookups by either participant.
- `Message`: `@@index([chatId, createdAt])` for efficient chat timeline queries, and `@@index([senderId, createdAt])` for per-sender queries.

## Normalization notes (1NF / 2NF / 3NF)

- **1NF**: all attributes are atomic (e.g., one message content per row; no repeating columns).
- **2NF**: many-to-many relationship (`User` ↔ `Chat`) is normalized via the `ChatParticipant` join table with a composite key.
- **3NF**: chat metadata and participant metadata are separated to avoid redundancy (e.g., per-user chat state like `lastReadAt` lives in `ChatParticipant`, not duplicated in `Chat` or `User`).

## Typical queries this schema supports well

- Fetch a user's chats: filter `ChatParticipant` by `userId`, then join `Chat`.
- Fetch messages in a chat ordered by time: filter `Message` by `chatId` and sort by `createdAt` (covered by index).
- Validate authorization: ensure `(chatId, userId)` exists in `ChatParticipant` (composite PK lookup).
- Enforce 1:1 chat uniqueness: lookup/create `DirectChat` using the stable-ordered pair `(user1Id, user2Id)`.

## Migrations applied

- Migrations live in [student-app/prisma/migrations](student-app/prisma/migrations).
- Apply schema changes locally:
	- `npm run db:migrate`

Example successful run (local DB):

```
npx prisma migrate dev
Applying migration `20251229074039_inchat`
Your database is now in sync with your schema.
```

## Seed data

- Seed script: [student-app/prisma/seed.ts](student-app/prisma/seed.ts)
- Run:
	- `npm run db:seed`

Example output:

```
Starting database seeding...
Cleared existing data
Created 3 users
Database seeding completed successfully!
Summary:
	- Users: 3
	- Chats: 2
	- Messages: 3
```

## Verify tables and records

- Open Prisma Studio:
	- `npm run db:studio`

## Reflection (scaling to 10x)

If the database had to support **10x** more users and messages, the design choices that help are:

- **Normalized join table (`ChatParticipant`)** keeps membership data consistent and enables efficient authorization checks.
- **Targeted composite indexes** (especially `Message(chatId, createdAt)`) support the most common access pattern: “timeline by chat”.
- **UUID primary keys** avoid contention on a single sequence generator and simplify sharding/merging environments.
- **Cascading deletes** prevent orphaned rows and keep cleanup fast and safe.
- **Optional Redis adapter** supports scaling Socket.IO horizontally without changing the DB model.

## Git workflow

Use feature branches + PRs:

- `feature/<name>`
- `fix/<name>`
- `chore/<name>`
