'use client';

import React from 'react';
import AppLink from '@/components/shared/AppLink';

const MobileFooter: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-[#222] bg-[#0f0f0f] px-4 py-6 text-xs text-slate-400">
      <div className="flex flex-wrap gap-3">
        <AppLink href="/about" className="hover:text-white">
          About
        </AppLink>
        <AppLink href="/privacy" className="hover:text-white">
          Privacy
        </AppLink>
        <AppLink href="/terms" className="hover:text-white">
          Terms
        </AppLink>
        <AppLink href="/?ui=desktop" prefetchOn="none" className="hover:text-white">
          Desktop Site
        </AppLink>
      </div>
      <p className="mt-4">� 2026 WebWorlds</p>
    </footer>
  );
};

export default MobileFooter;
