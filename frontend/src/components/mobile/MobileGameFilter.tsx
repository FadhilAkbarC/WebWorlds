'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

interface MobileGameFilterProps {
  categories: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

const MobileGameFilter: React.FC<MobileGameFilterProps> = ({
  categories,
  onSearchChange,
  onCategoryChange,
}) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');

  const sortedCategories = useMemo(() => ['all', ...categories], [categories]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            onSearchChange(value);
          }}
          placeholder="Search games"
          className="w-full rounded-2xl border border-[#2b2b2b] bg-[#141414] px-9 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sortedCategories.map((category) => {
          const value = category === 'all' ? '' : category;
          const isActive = active === value;
          return (
            <button
              key={category}
              onClick={() => {
                setActive(value);
                onCategoryChange(value);
              }}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                  : 'border-[#2b2b2b] bg-[#181818] text-slate-400'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileGameFilter;
