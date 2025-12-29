import { NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { getAuthCookieName } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: getAuthCookieName(),
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
