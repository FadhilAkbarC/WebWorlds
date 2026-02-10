'use client';

import React, { useMemo, useState } from 'react';
import AppLink from '@/components/shared/AppLink';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState('');

  const navLinks = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/search', label: 'Search' },
      { href: '/groups', label: 'Groups' },
      { href: '/editor', label: 'Create' },
    ],
    []
  );

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push('/search');
      return;
    }
    router.push(`/search?query=${encodeURIComponent(trimmed)}&tab=games`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1f1f1f] border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <AppLink href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black rounded-md flex items-center justify-center font-bold text-lg">
              W
            </div>
            <span className="text-lg font-bold text-white hidden sm:inline">
              WebWorlds
            </span>
          </AppLink>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Search"
                className="w-full bg-[#2a2a2a] border border-[#343434] rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#2a2a2a] border border-[#343434] text-slate-300">
              <Bell size={18} />
            </button>
            <AppLink
              href="/settings"
              className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#2a2a2a] border border-[#343434] text-slate-300"
            >
              <Settings size={18} />
            </AppLink>
            {user ? (
              <>
                <AppLink
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-[#2a2a2a] border border-[#343434] text-white text-sm"
                >
                  <User size={16} />
                  <span className="max-w-24 truncate">{user.username}</span>
                </AppLink>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <AppLink
                  href="/login"
                  className="px-3 py-2 text-sm text-slate-200 hover:text-white"
                >
                  Login
                </AppLink>
                <AppLink
                  href="/signup"
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  Sign Up
                </AppLink>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="Search"
              className="w-full bg-[#2a2a2a] border border-[#343434] rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <AppLink
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-[#2a2a2a] text-slate-200 hover:text-white'
                }`}
              >
                {link.label}
              </AppLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
