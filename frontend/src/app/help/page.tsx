'use client';

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I create a game?',
      answer: 'Click on the "Create" button in the navigation bar to open the game editor. Use the visual editor to design your game, then publish it when you\'re ready.'
    },
    {
      question: 'Can I play games offline?',
      answer: 'WebWorlds games require an internet connection to play. Games are streamed from our servers directly to your browser.'
    },
    {
      question: 'How do I publish my game?',
      answer: 'In the game editor, click the "Publish" button. Fill in the game details (title, description, genre, tags) and click Publish. Your game will be available in the Games section.'
    },
    {
      question: 'What file formats can I use?',
      answer: 'WebWorlds supports JavaScript/TypeScript for game code, and standard image formats (PNG, JPG) for assets.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'Go to Settings > Danger Zone and click "Delete Account". This action is permanent and cannot be undone.'
    },
    {
      question: 'Is WebWorlds free to use?',
      answer: 'Yes! WebWorlds is completely free to create and play games. We may offer premium features in the future.'
    },
    {
      question: 'Can I monetize my games?',
      answer: 'Currently, monetization features are not available. Check back soon for updates on this feature.'
    },
    {
      question: 'How do I report a game?',
      answer: 'Click the report button on any game\'s detail page and describe why you\'re reporting it. Our team will review it.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Help & Support</h1>
        <p className="text-slate-400 text-lg mb-12">Find answers to common questions and get in touch with our support team</p>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-blue-400" size={32} />
              <h2 className="text-2xl font-bold text-white">Email Support</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Have a question or issue? Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@webworlds.dev"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Send Email
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="text-purple-400" size={32} />
              <h2 className="text-2xl font-bold text-white">Discord Community</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Join our Discord community to chat with other creators and get quick answers.
            </p>
            <a
              href="https://discord.gg/webworlds"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Join Discord
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <HelpCircle className="text-yellow-400" size={32} />
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mb-8">Browse our FAQ for quick answers</p>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-600 transition-colors text-left"
                >
                  <span className="font-semibold text-white">{faq.question}</span>
                  <span className={`text-2xl text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 py-3 bg-slate-600 border-t border-slate-500 text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/docs" className="block p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <p className="font-semibold text-white">Documentation</p>
              <p className="text-slate-400 text-sm">Learn how to use WebWorlds</p>
            </a>
            <a href="/about" className="block p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <p className="font-semibold text-white">About WebWorlds</p>
              <p className="text-slate-400 text-sm">Learn more about our platform</p>
            </a>
            <a href="/privacy" className="block p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <p className="font-semibold text-white">Privacy Policy</p>
              <p className="text-slate-400 text-sm">How we protect your data</p>
            </a>
            <a href="/terms" className="block p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <p className="font-semibold text-white">Terms of Service</p>
              <p className="text-slate-400 text-sm">Our terms and conditions</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
