'use client';

import { useMemo, useState } from 'react';
import MobileStaticPage from '@/components/mobile/MobileStaticPage';
import { WBW_SYNTAX_TOPICS } from '@/lib/wbw-syntax-docs';

export default function MobileDocsPage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WBW_SYNTAX_TOPICS;
    return WBW_SYNTAX_TOPICS.filter((topic) =>
      [topic.title, topic.syntax, topic.example, topic.notes, ...(topic.aliases || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <MobileStaticPage title="WBW Documentation">
      <section>
        <p className="mb-2 text-sm text-slate-300">Cari syntax cepat ala forum:</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search syntax..."
          className="w-full rounded border border-[#2b2b2b] bg-[#151515] px-3 py-2 text-sm text-slate-100 outline-none"
        />
      </section>

      {filtered.map((topic) => (
        <section key={topic.id} className="rounded border border-[#2b2b2b] bg-[#141414] p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">{topic.title}</h3>
            <span className="rounded bg-[#232323] px-2 py-0.5 text-[10px] text-slate-300">{topic.category}</span>
          </div>
          <p className="text-xs text-slate-300">Syntax: <code>{topic.syntax}</code></p>
          <p className="text-xs text-emerald-300">Example: <code>{topic.example}</code></p>
          {topic.aliases && topic.aliases.length > 0 && (
            <p className="text-[11px] text-slate-400">Alias: {topic.aliases.join(', ')}</p>
          )}
          <p className="mt-1 text-xs text-slate-300">{topic.notes}</p>
        </section>
      ))}

      {filtered.length === 0 && (
        <section>
          <p className="text-sm text-slate-300">Tidak ada hasil. Coba kata kunci: <code>onpress</code>, <code>button</code>, <code>+=</code>.</p>
        </section>
      )}
    </MobileStaticPage>
  );
}
