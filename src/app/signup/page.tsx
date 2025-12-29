'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName, email, password }),
      });

      if (res.status === 409) {
        setError('Email already in use');
        return;
      }
      if (!res.ok) {
        setError('Could not create account');
        return;
      }

      router.push('/chats');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-zinc-600">Sign up to start chatting.</p>

      <form
        className="mt-6 flex flex-col gap-3"
        onSubmit={onSubmit}
        suppressHydrationWarning
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Display name</span>
          <input
            className="rounded-md border px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={80}
            suppressHydrationWarning
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            className="rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            suppressHydrationWarning
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            className="rounded-md border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            suppressHydrationWarning
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="mt-2 rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
          type="submit"
          disabled={loading}
          suppressHydrationWarning
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <a className="text-sm text-zinc-700 underline" href="/login">
          Back to login
        </a>
      </form>
    </div>
  );
}
