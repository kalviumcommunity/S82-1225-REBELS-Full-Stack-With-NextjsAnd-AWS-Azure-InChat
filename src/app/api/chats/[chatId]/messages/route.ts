import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

const sendSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export async function GET(_req: Request, ctx: { params: Promise<{ chatId: string }> }) {
  const me = await requireUserId();
  const { chatId } = await ctx.params;

  const participant = await prisma.chatParticipant.findUnique({
    where: { chatId_userId: { chatId, userId: me } },
    select: { chatId: true },
  });

  if (!participant) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { sender: { select: { id: true, displayName: true } } },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: { params: Promise<{ chatId: string }> }) {
  const me = await requireUserId();
  const { chatId } = await ctx.params;

  try {
    const body = sendSchema.parse(await req.json());

    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: me } },
      select: { chatId: true },
    });

    if (!participant) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: me,
        content: body.content,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
