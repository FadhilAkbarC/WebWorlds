import React from 'react';
import type { Metadata } from 'next';
import '../globals.css';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileTabBar from '@/components/mobile/MobileTabBar';
import MobileFooter from '@/components/mobile/MobileFooter';
import ChunkRecovery from '@/components/shared/ChunkRecovery';
import SlowConnectionNotice from '@/components/shared/SlowConnectionNotice';

export const metadata: Metadata = {
  title: 'WebWorlds Mobile',
  description: 'WebWorlds mobile experience',
};

export const viewport = 'width=device-width, initial-scale=1';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <SlowConnectionNotice />
        <MobileHeader />
        <main className="min-h-screen pb-24">{children}</main>
        <MobileFooter />
        <MobileTabBar />
        <ChunkRecovery />
      </body>
    </html>
  );
}


