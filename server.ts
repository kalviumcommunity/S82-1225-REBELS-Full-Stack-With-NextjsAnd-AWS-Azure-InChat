import 'dotenv/config';

import http from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { parse as parseCookie } from 'cookie';

import { prisma } from './src/lib/db';
import { env } from './src/lib/env';
import { getAuthCookieName, verifyAuthToken } from './src/lib/auth';

type MessageSendPayload = {
  chatId: string;
  content: string;
};

async function ensureParticipant(chatId: string, userId: string): Promise<void> {
  const participant = await prisma.chatParticipant.findUnique({
    where: { chatId_userId: { chatId, userId } },
    select: { chatId: true },
  });

  if (!participant) {
    throw new Error('Not a chat participant');
  }
}

async function main(): Promise<void> {
  const dev = env.NODE_ENV !== 'production';
  const port = env.PORT ?? 3000;

  const app = next({ dev, hostname: '0.0.0.0', port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = http.createServer((req, res) => {
    void handle(req, res);
  });

  const io = new SocketIOServer(server, {
    path: '/socket.io',
    cors: {
      origin: false,
      credentials: true,
    },
  });

  // Optional Redis adapter for horizontal scaling
  if (env.REDIS_URL) {
    const pubClient = createClient({ url: env.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.use(async (socket, nextFn) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return nextFn(new Error('Missing auth cookie'));
      }

      const cookies = parseCookie(cookieHeader);
      const token = cookies[getAuthCookieName()];
      if (!token) {
        return nextFn(new Error('Missing auth token'));
      }

      const payload = await verifyAuthToken(token);
      socket.data.userId = payload.userId;
      return nextFn();
    } catch {
      return nextFn(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;

    socket.on('chat:join', async (chatId: string, ack?: (ok: boolean) => void) => {
      try {
        await ensureParticipant(chatId, userId);
        await socket.join(chatId);
        ack?.(true);
      } catch {
        ack?.(false);
      }
    });

    socket.on('message:send', async (payload: MessageSendPayload, ack?: (ok: boolean) => void) => {
      try {
        if (!payload?.chatId || !payload?.content?.trim()) {
          ack?.(false);
          return;
        }

        await ensureParticipant(payload.chatId, userId);

        const message = await prisma.message.create({
          data: {
            chatId: payload.chatId,
            senderId: userId,
            content: payload.content.trim(),
          },
          include: {
            sender: { select: { id: true, displayName: true } },
          },
        });

        io.to(payload.chatId).emit('message:new', {
          id: message.id,
          chatId: message.chatId,
          sender: message.sender,
          content: message.content,
          createdAt: message.createdAt,
        });

        ack?.(true);
      } catch {
        ack?.(false);
      }
    });
  });

  server.listen(port, () => {
    console.log(`Inchat server listening on http://localhost:${port}`);
  });
}

void main();
