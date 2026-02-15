'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Plus, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import MobileLink from '@/components/mobile/MobileLink';
import { BroadcastRefreshSettingsButton } from '@/components/shared/BroadcastRefresh';

const MobileHeader: React.FC = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (pathname.startsWith('/play/')) return null;

  return (
    <header className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur border-b border-[#232323]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BroadcastRefreshSettingsButton />
          <MobileLink href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              W
            </div>
            <span className="text-base font-semibold text-white">WebWorlds</span>
          </MobileLink>
        </div>
        <div className="flex items-center gap-2">
          <MobileLink
            href="/search"
            className="w-9 h-9 rounded-full bg-[#222] border border-[#2f2f2f] flex items-center justify-center text-slate-200"
            aria-label="Search"
          >
            <Search size={16} />
          </MobileLink>
          <MobileLink
            href="/editor"
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center"
            aria-label="Create"
          >
            <Plus size={16} />
          </MobileLink>
          <MobileLink
            href={user ? '/profile' : '/login'}
            className="w-9 h-9 rounded-full bg-[#222] border border-[#2f2f2f] flex items-center justify-center text-white"
            aria-label="Profile"
          >
            {user?.username ? (
              <span className="text-xs font-semibold">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
            ) : (
              <User size={16} />
            )}
          </MobileLink>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;

