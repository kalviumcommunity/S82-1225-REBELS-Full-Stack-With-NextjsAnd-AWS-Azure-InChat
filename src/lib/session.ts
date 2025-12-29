import { cookies } from 'next/headers';
import { getAuthCookieName, verifyAuthToken } from './auth';

export async function getUserIdFromCookies(): Promise<string | null> {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  if (!token) return null;

  try {
    const payload = await verifyAuthToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}

export async function requireUserId(): Promise<string> {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return userId;
}
