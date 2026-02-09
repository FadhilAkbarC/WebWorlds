import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebWorlds - Play & Create Web Games',
  description: 'A lightweight, innovative web-based gaming platform for creating and playing user-generated games. Play on any device, anytime.',
  keywords: 'games, web games, user-generated content, roblox alternative, indie games',
  openGraph: {
    title: 'WebWorlds',
    description: 'Play & Create Web Games',
    type: 'website',
  },
};

export const viewport = 'width=device-width, initial-scale=1';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230ea5e9'/><text x='50' y='75' font-size='70' font-weight='bold' fill='white' text-anchor='middle'>W</text></svg>" />
      </head>
      <body className="bg-slate-950 text-white">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
