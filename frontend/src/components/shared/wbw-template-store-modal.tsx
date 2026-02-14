'use client';

import React, { useMemo, useState } from 'react';
import {
  WBW_BUILTIN_TEMPLATES,
  WBW_TEMPLATE_CATEGORIES,
  type WBWTemplateCategory,
  type WBWTemplateDefinition,
} from '@/lib/wbw-template-store';

interface WBWTemplateStoreModalProps {
  open: boolean;
  onClose: () => void;
  onUseAsProject: (template: WBWTemplateDefinition) => void;
  onAddScript: (template: WBWTemplateDefinition) => void;
}

export default function WBWTemplateStoreModal({
  open,
  onClose,
  onUseAsProject,
  onAddScript,
}: WBWTemplateStoreModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<WBWTemplateCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WBW_BUILTIN_TEMPLATES.filter((template) => {
      const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
      const queryMatch =
        !q ||
        template.title.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.category.toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [query, selectedCategory]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-6xl rounded-lg border border-slate-700 bg-slate-900 p-6 max-h-[88vh] overflow-y-auto">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">Template Store / Creator Store</h3>
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-3 py-1 text-sm text-slate-200 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-300">
          Pilih template bawaan siap pakai untuk mulai bikin game lebih cepat. Gunakan filter kategori untuk hemat waktu dan ringan saat browsing.
        </p>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari template (judul, deskripsi, kategori)..."
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as WBWTemplateCategory | 'all')}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {WBW_TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <div key={template.id} className="rounded border border-slate-700 bg-slate-800 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-white">{template.title}</h4>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-200">{template.category}</span>
              </div>
              <p className="mb-2 text-xs text-slate-300">Difficulty: {template.difficulty}</p>
              <p className="mb-4 text-sm text-slate-300">{template.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onUseAsProject(template)}
                  className="flex-1 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Use as Project
                </button>
                <button
                  onClick={() => onAddScript(template)}
                  className="flex-1 rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Add Script
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-4 rounded border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
            Tidak ada template yang cocok dengan filter saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
