import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/session';

export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, createdAt: true },
  });

  return NextResponse.json({ user: user ?? null }, { status: 200 });
}
