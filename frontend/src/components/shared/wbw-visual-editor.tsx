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
  { id: 'player', title: 'Player', category: 'core', line: 'player 120 1040 18 24' },
  { id: 'platform', title: 'Platform', category: 'core', line: 'platform 0 1120 2400 80' },
  { id: 'enemy', title: 'Enemy', category: 'core', line: 'enemy bot1 640 1040 18 18' },
  { id: 'item', title: 'Item', category: 'core', line: 'item gem1 980 760 12 12' },
  { id: 'set', title: 'Set Var', category: 'logic', line: 'SCORE = 0' },
  { id: 'if', title: 'If', category: 'logic', line: 'if SCORE >= 100 goto win' },
  { id: 'ifnot', title: 'If Not', category: 'logic', line: 'ifnot HP > 0 goto gameover' },
  { id: 'goto', title: 'Goto', category: 'logic', line: 'goto start' },
  { id: 'onpress', title: 'OnPress', category: 'interaction', line: 'onpress up jump 10' },
  { id: 'touch', title: 'Touch', category: 'interaction', line: 'touch auto' },
  { id: 'msg', title: 'Message', category: 'interaction', line: 'msg "Hello" 1' },
  { id: 'button', title: 'UI Button', category: 'ui', line: 'button start 420 300 320 60 "Start"' },
  { id: 'onui', title: 'On UI', category: 'ui', line: 'onui start goto start_game' },
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLines(parseLines(value));
  }, [value]);

  const groupedTemplates = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: BLOCK_TEMPLATES.filter((template) => template.category === category),
      })),
    []
  );

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

  const removeLine = (index: number) => {
    if (readOnly) return;
    emit(lines.filter((_, i) => i !== index));
  };

  const onDropTemplate = (line: string, dropIndex?: number) => {
    if (readOnly) return;
    const next = [...lines];
    if (dropIndex === undefined || dropIndex < 0 || dropIndex > next.length) {
      next.push(line);
    } else {
      next.splice(dropIndex, 0, line);
    }
    emit(next);
  };

  const onDropReorder = (dropIndex: number) => {
    if (readOnly || draggedIndex === null || draggedIndex === dropIndex) return;
    const next = [...lines];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(dropIndex, 0, moved);
    emit(next);
    setDraggedIndex(null);
  };

  return (
    <div className="flex h-full min-h-0 gap-3 bg-slate-900 p-3">
      <div className="w-52 shrink-0 rounded border border-slate-700 bg-slate-800 p-2">
        <p className="mb-2 text-[10px] font-bold uppercase text-slate-300">Block Explorer</p>
        <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
          {groupedTemplates.map((group) => (
            <details key={group.category} open className="rounded border border-slate-700 bg-slate-900 p-1.5">
              <summary className="cursor-pointer text-[10px] font-semibold uppercase text-slate-300">{group.category}</summary>
              <div className="mt-1.5 space-y-1">
                {group.items.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    draggable={!readOnly}
                    disabled={readOnly}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/wbw-template-line', template.line);
                    }}
                    onClick={() => addLine(template.line)}
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-left text-[10px] text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                  >
                    <p className="font-semibold text-white">{template.title}</p>
                    <p className="mt-0.5 text-[9px] text-slate-400">{template.line}</p>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div
        className="min-h-0 flex-1 rounded border border-slate-700 bg-slate-800 p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const line = e.dataTransfer.getData('text/wbw-template-line');
          if (line) onDropTemplate(line);
        }}
      >
        <p className="mb-2 text-xs font-bold uppercase text-slate-300">Script Blocks (Drag & Drop)</p>
        {lines.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded border border-dashed border-slate-600 text-sm text-slate-400">
            Drag block ke sini
          </div>
        ) : (
          <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
            {lines.map((line, index) => (
              <div
                key={`${index}-${line}`}
                draggable={!readOnly}
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropReorder(index)}
                className="rounded border border-slate-700 bg-slate-900 p-2"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">#{index + 1}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="rounded bg-red-700 px-2 py-0.5 text-[11px] text-white"
                    >
                      Del
                    </button>
                  )}
                </div>
                <input
                  value={line}
                  onChange={(e) => updateLine(index, e.target.value)}
                  readOnly={readOnly}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
