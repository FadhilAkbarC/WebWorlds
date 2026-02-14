'use client';

import React, { useEffect, useMemo, useState } from 'react';

type WBWVisualEditorProps = {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
};

type BlockTemplate = {
  id: string;
  title: string;
  category: 'core' | 'logic' | 'interaction' | 'ui';
  line: string;
};

const BLOCK_TEMPLATES: BlockTemplate[] = [
  { id: 'player', title: 'Player Spawn', category: 'core', line: 'player 120 1040 18 24' },
  { id: 'platform', title: 'Platform', category: 'core', line: 'platform 0 1120 2400 80' },
  { id: 'enemy', title: 'Enemy', category: 'core', line: 'enemy bot1 640 1040 18 18' },
  { id: 'item', title: 'Item', category: 'core', line: 'item gem1 980 760 12 12' },
  { id: 'set', title: 'Set Variable', category: 'logic', line: 'SCORE = 0' },
  { id: 'if', title: 'If Condition', category: 'logic', line: 'if SCORE >= 100 goto win' },
  { id: 'ifnot', title: 'If Not Condition', category: 'logic', line: 'ifnot HP > 0 goto gameover' },
  { id: 'goto', title: 'Goto Label', category: 'logic', line: 'goto start' },
  { id: 'onpress', title: 'OnPress', category: 'interaction', line: 'onpress up jump 10' },
  { id: 'touch', title: 'Touch Mode', category: 'interaction', line: 'touch auto' },
  { id: 'msg', title: 'Message', category: 'interaction', line: 'msg "Hello" 1' },
  { id: 'button', title: 'UI Button', category: 'ui', line: 'button start 420 300 320 60 "Start"' },
  { id: 'onui', title: 'On UI Click', category: 'ui', line: 'onui start goto start_game' },
];

const CATEGORY_ORDER: Array<BlockTemplate['category']> = ['core', 'logic', 'interaction', 'ui'];

function parseLines(code: string): string[] {
  return code
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
}

export default function WBWVisualEditor({ value, onChange, readOnly = false }: WBWVisualEditorProps) {
  const [lines, setLines] = useState<string[]>(() => parseLines(value));

  useEffect(() => {
    setLines(parseLines(value));
  }, [value]);

  const groupedTemplates = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: BLOCK_TEMPLATES.filter((template) => template.category === category),
    }));
  }, []);

  const emit = (next: string[]) => {
    setLines(next);
    onChange(next.join('\n'));
  };

  const addLine = (line: string) => {
    if (readOnly) return;
    emit([...lines, line]);
  };

  const updateLine = (index: number, line: string) => {
    if (readOnly) return;
    const next = [...lines];
    next[index] = line;
    emit(next);
  };

  const moveLine = (index: number, dir: -1 | 1) => {
    if (readOnly) return;
    const target = index + dir;
    if (target < 0 || target >= lines.length) return;
    const next = [...lines];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    emit(next);
  };

  const removeLine = (index: number) => {
    if (readOnly) return;
    emit(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-full flex-col gap-3 bg-slate-900 p-3">
      <div className="rounded border border-slate-700 bg-slate-800 p-3">
        <p className="mb-2 text-xs font-bold uppercase text-slate-300">Visual Coding Palette</p>
        <div className="space-y-2">
          {groupedTemplates.map((group) => (
            <details key={group.category} open className="rounded border border-slate-700 bg-slate-900 p-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-300">{group.category}</summary>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.items.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    disabled={readOnly}
                    onClick={() => addLine(template.line)}
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                  >
                    <p className="font-semibold text-white">{template.title}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{template.line}</p>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded border border-slate-700 bg-slate-800 p-3">
        <p className="mb-2 text-xs font-bold uppercase text-slate-300">Block Sequence</p>
        {lines.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada block. Tambahkan dari palette.</p>
        ) : (
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={`${index}-${line}`} className="rounded border border-slate-700 bg-slate-900 p-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">#{index + 1}</span>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveLine(index, -1)}
                        className="rounded bg-slate-700 px-2 py-0.5 text-[11px] text-white"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLine(index, 1)}
                        className="rounded bg-slate-700 px-2 py-0.5 text-[11px] text-white"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="rounded bg-red-700 px-2 py-0.5 text-[11px] text-white"
                      >
                        Del
                      </button>
                    </div>
                  )}
                </div>
                <input
                  value={line}
                  onChange={(e) => updateLine(index, e.target.value)}
                  readOnly={readOnly}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
