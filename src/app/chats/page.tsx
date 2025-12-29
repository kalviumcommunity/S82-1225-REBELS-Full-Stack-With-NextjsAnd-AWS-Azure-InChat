'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Me = { id: string; email: string; displayName: string };

type UserListItem = { id: string; displayName: string; email: string };

type ChatListItem = {
  id: string;
  otherUser: UserListItem | null;
  lastMessage: null | {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; displayName: string };
  };
  updatedAt: string;
};

export default function ChatsPage() {
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [otherUserId, setOtherUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const otherUserOptions = useMemo(() => users, [users]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      const meJson = (await meRes.json()) as { user: Me | null };

      if (!meJson.user) {
        router.push('/login');
        router.refresh();
        return;
      }

      const [usersRes, chatsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/chats'),
      ]);

      if (cancelled) return;

      const usersJson = (await usersRes.json()) as { users: UserListItem[] };
      const chatsJson = (await chatsRes.json()) as { chats: ChatListItem[] };

      setMe(meJson.user);
      setUsers(usersJson.users);
      setChats(chatsJson.chats);
      setOtherUserId(usersJson.users[0]?.id ?? '');
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  async function startChat() {
    if (!otherUserId) return;

    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ otherUserId }),
    });

    if (!res.ok) return;

    const json = (await res.json()) as { chatId: string };
    router.push(`/chats/${json.chatId}`);
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chats</h1>
          <p className="text-sm text-zinc-600">Signed in as {me?.displayName}</p>
        </div>
        <button className="rounded-md border px-3 py-2 text-sm" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Start a chat</span>
          <select
            className="rounded-md border px-3 py-2"
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
          >
            {otherUserOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName} ({u.email})
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-md bg-black px-3 py-2 text-sm text-white" onClick={startChat}>
          Open
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {chats.length === 0 ? (
          <p className="text-sm text-zinc-600">No chats yet.</p>
        ) : (
          chats.map((c) => (
            <a
              key={c.id}
              href={`/chats/${c.id}`}
              className="rounded-md border px-4 py-3 hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.otherUser?.displayName ?? 'Unknown'}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(c.updatedAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-1 text-sm text-zinc-600">
                {c.lastMessage ? c.lastMessage.content : 'No messages yet'}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
