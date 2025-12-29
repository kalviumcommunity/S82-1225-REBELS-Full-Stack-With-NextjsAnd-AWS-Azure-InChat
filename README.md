Inchat
Inchat is a WhatsApp-like one-to-one realtime chat app built with Next.js (TypeScript), Prisma, PostgreSQL, and Socket.IO.

Whats included
Normalized schema: Users, Chats, ChatParticipants, DirectChat, Messages (constraints + indexes)
Secure auth: bcrypt password hashing + JWT in an httpOnly cookie
Realtime messaging: Socket.IO rooms per chat (cookie-authenticated)
Optional scaling: Redis adapter enabled when REDIS_URL is set
Dockerized local dev: app + postgres + redis via Docker Compose