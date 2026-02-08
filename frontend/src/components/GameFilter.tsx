'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface GameFilterProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const GameFilter: React.FC<GameFilterProps> = ({
  onSearchChange,
  onCategoryChange,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white hover:border-blue-500 transition-colors w-full sm:w-auto"
          >
            <Filter size={20} />
            <span>
              {selectedCategory || 'Category'}
            </span>
          </button>

          {isOpen && (
            <div className="absolute top-full mt-2 bg-slate-700 border border-slate-600 rounded-lg w-48 z-10 shadow-lg">
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-4 py-2 hover:bg-slate-600 transition-colors first:rounded-t-lg ${
                  !selectedCategory ? 'bg-blue-600 text-white' : 'text-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-600 transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
