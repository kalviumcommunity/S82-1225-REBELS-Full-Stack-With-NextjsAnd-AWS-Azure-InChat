'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { getSocket } from '@/lib/socket-client';

type Me = { id: string; displayName: string };

type Message = {
  id: string;
  chatId: string;
  content: string;
  createdAt: string;
  sender: { id: string; displayName: string };
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;

  const [me, setMe] = useState<Me | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [ready, setReady] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const meRes = await fetch('/api/auth/me');
      const meJson = (await meRes.json()) as { user: Me | null };

      if (!meJson.user) {
        router.push('/login');
        router.refresh();
        return;
      }

      const msgRes = await fetch(`/api/chats/${chatId}/messages`);
      if (msgRes.status === 404) {
        router.push('/chats');
        return;
      }

      const msgJson = (await msgRes.json()) as { messages: Message[] };

      if (cancelled) return;
      setMe(meJson.user);
      setMessages(
        msgJson.messages.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt).toISOString(),
        })),
      );
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [chatId, router]);

  useEffect(() => {
    if (!ready) return;

    function onNewMessage(m: Message) {
      if (m.chatId !== chatId) return;
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, { ...m, createdAt: new Date(m.createdAt).toISOString() }];
      });
    }

    socket.on('connect', () => {
      socket.emit('chat:join', chatId);
    });

    socket.on('message:new', onNewMessage);

    if (socket.connected) {
      socket.emit('chat:join', chatId);
    }

    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, [chatId, ready, socket]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    setContent('');

    socket.emit('message:send', { chatId, content: trimmed }, (ok: boolean) => {
      if (!ok) {
        // fallback: restore text on failure
        setContent(trimmed);
      }
    });
  }

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" href="/chats">
          Back
        </Link>
        <div className="text-sm text-zinc-600">{me?.displayName}</div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-2 rounded-md border p-4">
        {messages.map((m) => {
          const mine = m.sender.id === me?.id;
          return (
            <div key={m.id} className={mine ? 'self-end' : 'self-start'}>
              <div
                className={
                  mine
                    ? 'max-w-md rounded-lg bg-black px-3 py-2 text-sm text-white'
                    : 'max-w-md rounded-lg bg-zinc-100 px-3 py-2 text-sm text-black'
                }
              >
                <div className="text-xs opacity-70">{m.sender.displayName}</div>
                <div>{m.content}</div>
                <div className="mt-1 text-[10px] opacity-70">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="mt-4 flex gap-2" onSubmit={sendMessage}>
        <input
          className="flex-1 rounded-md border px-3 py-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
        />
        <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
