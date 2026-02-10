'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, PlusSquare, User } from 'lucide-react';
import MobileLink from '@/components/mobile/MobileLink';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games', label: 'Games', icon: Grid },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/editor', label: 'Create', icon: PlusSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

const MobileTabBar: React.FC = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/play/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#222] bg-[#111]/95 backdrop-blur">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActivePath(pathname, tab.href);
          return (
            <MobileLink
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                active ? 'text-blue-300' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </MobileLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;

