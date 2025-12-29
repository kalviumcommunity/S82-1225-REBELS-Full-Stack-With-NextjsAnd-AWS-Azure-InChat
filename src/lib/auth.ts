import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import { env } from './env';

const tokenName = 'inchat_token';

function secretKey(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export type AuthTokenPayload = JWTPayload & {
  userId: string;
};

export function getAuthCookieName(): string {
  return tokenName;
}

export async function signAuthToken(userId: string): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);

  return new SignJWT({ userId } satisfies AuthTokenPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + 60 * 60 * 24 * 7) // 7 days
    .sign(secretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify<AuthTokenPayload>(token, secretKey(), {
    algorithms: ['HS256'],
  });

  if (!payload.userId) {
    throw new Error('Invalid token payload');
  }

  return payload;
}
