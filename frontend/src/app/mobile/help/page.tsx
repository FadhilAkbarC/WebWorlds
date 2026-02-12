'use client';

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import MobileLink from '@/components/mobile/MobileLink';

export default function MobileHelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I create a game?',
      answer:
        'Tap "Create" to open the editor. Build your game and publish when ready.',
    },
    {
      question: 'Can I play games offline?',
      answer: 'WebWorlds games require an internet connection to play.',
    },
    {
      question: 'How do I publish my game?',
      answer:
        'In the editor, tap Publish, fill in the details, and confirm to go live.',
    },
    {
      question: 'Is WebWorlds free?',
      answer: 'Yes, WebWorlds is free to create and play games.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Help & Support</h1>
        <p className="text-xs text-slate-400">Quick answers and ways to reach us.</p>
      </div>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Mail size={16} className="text-blue-300" />
          <h2 className="text-sm font-semibold">Email Support</h2>
        </div>
        <p className="text-xs text-slate-300">
          Have a question? Email us and we&apos;ll get back within 24 hours.
        </p>
        <a
          href="mailto:support@webworlds.dev"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Send Email <ExternalLink size={12} />
        </a>
      </div>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={16} className="text-purple-300" />
          <h2 className="text-sm font-semibold">Discord Community</h2>
        </div>
        <p className="text-xs text-slate-300">
          Join our community to chat with creators and get quick answers.
        </p>
        <a
          href="https://discord.gg/webworlds"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Join Discord <ExternalLink size={12} />
        </a>
      </div>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4">
        <div className="flex items-center gap-2 text-white mb-3">
          <HelpCircle size={16} className="text-yellow-300" />
          <h2 className="text-sm font-semibold">FAQs</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={faq.question} className="rounded-xl border border-[#2b2b2b] bg-[#121212]">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-white flex items-center justify-between"
              >
                {faq.question}
                <span className="text-slate-400">{expandedFaq === idx ? '-' : '+'}</span>
              </button>
              {expandedFaq === idx && (
                <div className="px-3 pb-3 text-[11px] text-slate-300">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-300">
        <p className="font-semibold text-white mb-2">Resources</p>
        <div className="flex flex-col gap-2">
          <MobileLink href="/docs" className="text-blue-300">Documentation</MobileLink>
          <MobileLink href="/about" className="text-blue-300">About WebWorlds</MobileLink>
          <MobileLink href="/privacy" className="text-blue-300">Privacy Policy</MobileLink>
          <MobileLink href="/terms" className="text-blue-300">Terms of Service</MobileLink>
        </div>
      </div>
    </div>
  );
}


