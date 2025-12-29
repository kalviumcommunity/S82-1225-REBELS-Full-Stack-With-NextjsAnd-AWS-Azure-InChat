import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

const createSchema = z.object({
  otherUserId: z.string().uuid(),
});

export async function GET() {
  const me = await requireUserId();

  const chats = await prisma.chat.findMany({
    where: {
      type: 'DIRECT',
      participants: { some: { userId: me } },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      direct: true,
      participants: {
        include: {
          user: { select: { id: true, displayName: true, email: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { id: true, displayName: true } } },
      },
    },
  });

    const result = chats.map((c) => {
    const other = c.participants.find((p) => p.userId !== me)?.user ?? null;
    const lastMessage = c.messages[0] ?? null;
    return {
      id: c.id,
      type: c.type,
      otherUser: other,
      lastMessage,
      updatedAt: c.updatedAt,
    };
  });

  return NextResponse.json({ chats: result });
}

export async function POST(req: Request) {
  const me = await requireUserId();

  try {
    const body = createSchema.parse(await req.json());

    if (body.otherUserId === me) {
      return NextResponse.json({ error: 'INVALID_OTHER_USER' }, { status: 400 });
    }

    const user1Id = me < body.otherUserId ? me : body.otherUserId;
    const user2Id = me < body.otherUserId ? body.otherUserId : me;

    const existing = await prisma.directChat.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      include: { chat: true },
    });

    if (existing) {
      return NextResponse.json({ chatId: existing.chatId }, { status: 200 });
    }

    const created = await prisma.chat.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [{ userId: me }, { userId: body.otherUserId }],
        },
        direct: {
          create: { user1Id, user2Id },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ chatId: created.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
