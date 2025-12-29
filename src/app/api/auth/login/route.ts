import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { signAuthToken, getAuthCookieName } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

const bodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true, email: true, displayName: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
    }

    const token = await signAuthToken(user.id);
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });

    res.cookies.set({
      name: getAuthCookieName(),
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
