'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import MobileLink from '@/components/mobile/MobileLink';

export default function MobileHomeHero() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mb-4 rounded-2xl border border-[#222] bg-gradient-to-br from-blue-600/20 via-[#151515] to-[#111] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Welcome back</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">
        {user?.username ? `Hi ${user.username}` : 'Discover new worlds'}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Fast loads, lighter UI, and instant play.
      </p>
      <div className="mt-4 flex gap-3">
        <MobileLink
          href="/games"
          className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-center text-xs font-semibold"
        >
          Browse games
        </MobileLink>
        <MobileLink
          href="/editor"
          className="flex-1 rounded-full border border-blue-500/50 px-4 py-2 text-center text-xs font-semibold text-blue-200"
        >
          Create
        </MobileLink>
      </div>
    </div>
  );
}
