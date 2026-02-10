'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function HomeUserHeader() {
  const { user } = useAuthStore();
  const initial = user?.username?.slice(0, 1)?.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[#2a2a2a] border border-[#343434] flex items-center justify-center text-slate-300">
        {initial}
      </div>
      <div>
        <p className="text-sm text-slate-400">Home</p>
        <p className="text-lg font-semibold text-white">
          {user?.username || 'Guest'}
        </p>
      </div>
    </div>
  );
}

