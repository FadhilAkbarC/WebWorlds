'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Users, Code, Sparkles, ArrowRight } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { useGameStore } from '@/stores/gameStore';

const FEATURED_GAMES = [
  {
    _id: '1',
    title: 'Space Adventure',
    description: 'Epic space exploration game',
    creatorId: 'creator1',
    creatorName: 'GameDev123',
    thumbnail: 'https://images.unsplash.com/photo-1538481143081-267382c3d1d7?w=500&h=300&fit=crop',
    genre: ['Adventure', 'Action'],
    category: 'Adventure',
    mainFile: '',
    version: 1,
    rating: 4.5,
    plays: 15420,
    likes: 3200,
    comments: 245,
    featured: true,
    published: new Date().toISOString(),
    updated: new Date().toISOString(),
    visibility: 'public' as const,
    tags: ['space', 'shooter'],
  },
  {
    _id: '2',
    title: 'Puzzle Master',
    description: 'Mind-bending puzzle challenges',
    creatorId: 'creator2',
    creatorName: 'Puzzle_Pro',
    thumbnail: 'https://images.unsplash.com/photo-1611080626919-7cf23a01f5b2?w=500&h=300&fit=crop',
    genre: ['Puzzle'],
    category: 'Puzzle',
    mainFile: '',
    version: 1,
    rating: 4.8,
    plays: 28942,
    likes: 5120,
    comments: 512,
    featured: true,
    published: new Date().toISOString(),
    updated: new Date().toISOString(),
    visibility: 'public' as const,
    tags: ['puzzle', 'brain'],
  },
];

export default function Home() {
  const { fetchGames, games, isLoading } = useGameStore();

  useEffect(() => {
    fetchGames(1);
  }, [fetchGames]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Play & Create Web Games
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Welcome to WebWorlds – the lightweight, innovative platform for user-generated games. Create amazing experiences and play on any device.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/games"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Browse Games
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Create a Game
                <Code size={20} />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-slate-700">
            <div className="space-y-2">
              <p className="text-3xl font-bold text-blue-400">1000+</p>
              <p className="text-slate-400">Games Created</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-purple-400">50K+</p>
              <p className="text-slate-400">Active Players</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-pink-400">1M+</p>
              <p className="text-slate-400">Total Plays</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why WebWorlds?</h2>
            <p className="text-slate-400 text-lg">
              Built for everyone, optimized for everything
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized for weak devices and slow networks',
              },
              {
                icon: Users,
                title: 'Real-time Multiplayer',
                description: 'Play with friends instantly, anywhere',
              },
              {
                icon: Code,
                title: 'Easy to Create',
                description: 'Simple browser-based editor, no setup needed',
              },
              {
                icon: Sparkles,
                title: 'User-Generated',
                description: 'Unleash creativity with unlimited possibilities',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-800 rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 transform"
              >
                <feature.icon className="text-blue-400 mb-4" size={32} />
                <h3 className="text-white font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">Featured Games</h2>
            <Link href="/games" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2">
              View All
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {FEATURED_GAMES.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>

          {/* Trending Games */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-8">Trending Now</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {games.slice(0, 4).map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Create?
            </h3>
            <p className="text-blue-100 mb-6">
              Join thousands of creators building amazing experiences
            </p>
            <Link
              href="/editor"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Start Creating Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
