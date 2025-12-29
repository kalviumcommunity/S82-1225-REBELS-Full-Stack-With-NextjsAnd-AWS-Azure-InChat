import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { signAuthToken, getAuthCookieName } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

const bodySchema = z.object({
  email: z.string().email().max(320),
  displayName: z.string().min(1).max(80),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: 'EMAIL_IN_USE' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        displayName: body.displayName,
        passwordHash: await hashPassword(body.password),
      },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });

    const token = await signAuthToken(user.id);
    const res = NextResponse.json({ user });

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
