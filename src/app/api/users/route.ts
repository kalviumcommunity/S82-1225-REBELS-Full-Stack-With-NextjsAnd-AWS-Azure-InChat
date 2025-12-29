import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireUserId } from '@/lib/session';

export async function GET() {
  const me = await requireUserId();

  const users = await prisma.user.findMany({
    where: { id: { not: me } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, displayName: true, email: true },
  });

  return NextResponse.json({ users });
}
