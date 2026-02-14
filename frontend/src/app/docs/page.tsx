'use client';

import { useMemo, useState } from 'react';
import { WBW_SYNTAX_TOPICS } from '@/lib/wbw-syntax-docs';

const categories = ['all', 'core', 'logic', 'events', 'ui', 'camera', 'timers', 'math'] as const;

export default function DocsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WBW_SYNTAX_TOPICS.filter((topic) => {
      const categoryMatch = category === 'all' || topic.category === category;
      if (!categoryMatch) return false;
      if (!q) return true;
      const bag = [topic.title, topic.syntax, topic.example, topic.notes, ...(topic.aliases || [])]
        .join(' ')
        .toLowerCase();
      return bag.includes(q);
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-5xl font-bold text-white">WBW Documentation</h1>
        <p className="mb-6 text-slate-300">
          Search syntax seperti forum thread: ketik kata kunci, filter kategori, lalu copy syntax yang dibutuhkan. Editor kini default ke visual coding ala Scratch, dan block akan dikonversi ke WBW syntax.
        </p>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search syntax, alias, command, variable..."
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof categories)[number])}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-slate-100 outline-none focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((chip) => (
            <button
              key={chip}
              onClick={() => setCategory(chip)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                category === chip ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              #{chip}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((topic) => (
            <article key={topic.id} className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-white">{topic.title}</h2>
                <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200">{topic.category}</span>
              </div>
              <p className="mb-2 text-sm text-slate-300">Syntax: <code>{topic.syntax}</code></p>
              {topic.aliases && topic.aliases.length > 0 && (
                <p className="mb-2 text-xs text-slate-400">Alias: {topic.aliases.join(', ')}</p>
              )}
              <p className="mb-2 text-sm text-emerald-300">Example: <code>{topic.example}</code></p>
              <p className="text-sm text-slate-300">{topic.notes}</p>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 p-4 text-slate-300">
            Tidak ada syntax yang cocok. Coba kata kunci lain seperti <code>if</code>, <code>onui</code>, <code>camfollow</code>, atau <code>+=</code>.
          </div>
        )}
      </div>
    </div>
  );
}
