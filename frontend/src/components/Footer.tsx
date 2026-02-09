'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4">WebWorlds</h3>
            <p className="text-slate-400 text-sm">
              A lightweight, innovative web-based gaming platform for creating and playing user-generated games.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-slate-400 hover:text-white transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-slate-400 hover:text-white transition-colors">
                  Groups
                </Link>
              </li>
              <li>
                <Link href="/editor" className="text-slate-400 hover:text-white transition-colors">
                  Create Game
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-slate-400 hover:text-white transition-colors">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:hello@webworlds.dev"
                className="text-slate-400 hover:text-orange-400 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; 2026 WebWorlds. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
