import { redirect } from 'next/navigation';

import { getUserIdFromCookies } from '@/lib/session';

export default async function Home() {
  const userId = await getUserIdFromCookies();
  redirect(userId ? '/chats' : '/login');
}
