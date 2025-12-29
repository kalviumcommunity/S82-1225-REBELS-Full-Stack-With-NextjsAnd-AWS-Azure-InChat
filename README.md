# Inchat

Inchat is a WhatsApp-like one-to-one realtime chat app built with Next.js (TypeScript), Prisma, PostgreSQL, and Socket.IO.

## What's included

- Normalized schema (Users, Chats, Participants, DirectChat, Messages)
- Auth: bcrypt + JWT in httpOnly cookie
- Realtime chat: Socket.IO rooms
- Optional scaling: Redis adapter when `REDIS_URL` is set
- Docker Compose: app + Postgres + Redis

## PostgreSQL Schema Design (Assignment)

- **Schema**: [student-app/prisma/schema.prisma](student-app/prisma/schema.prisma)
- **Migrations**: [student-app/prisma/migrations](student-app/prisma/migrations)
- **Seed**: [student-app/prisma/seed.ts](student-app/prisma/seed.ts)

### Entities

- `User`, `Chat`, `Message`, `ChatParticipant` (join table), `DirectChat` (1:1)

### Relationships

- `User -> Message` (sender)
- `Chat -> Message` (timeline)
- `User <-> Chat` via `ChatParticipant(chatId, userId)`
- `Chat -> DirectChat` (optional 1:1 detail)

### Constraints / keys / indexes (high level)

- `User.email` unique
- `ChatParticipant` composite PK: `([chatId, userId])`
- `DirectChat` unique pair: `([user1Id, user2Id])` (store IDs in stable sorted order)
- Timeline index: `Message([chatId, createdAt])`
- Membership lookup indexes: `ChatParticipant([userId])`, `ChatParticipant([chatId])`

### Proof commands (migration + seed)

1) Start DB (Docker, from repo root): `docker compose up -d db`
2) Migrate (from `student-app/`): `npm run db:migrate`
3) Seed (from `student-app/`): `npm run db:seed`
4) Verify tables/data (from `student-app/`): `npm run db:studio`

### Reflection (10x scaling)

- Normalization + join table reduces duplication and keeps membership consistent
- Indexed message timeline keeps common reads fast
- Constraints prevent duplicates and protect data integrity