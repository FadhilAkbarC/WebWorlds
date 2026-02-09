import React, { useEffect, useMemo, useRef } from 'react';

type WBWEditorProps = {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
};

const GROUPS = {
  core: new Set([
    'player',
    'spawn',
    'platform',
    'rect',
    'circle',
    'line',
    'tri',
    'bg',
    'color',
    'pcolor',
    'size',
    'text',
    'textsize',
    'hud',
  ]),
  input: new Set(['on', 'onpress', 'onrelease', 'move', 'jump', 'shoot', 'vel', 'push']),
  flow: new Set(['if', 'goto', 'loop', 'end', 'stop']),
  math: new Set(['set', 'add', 'sub', 'mul', 'div', 'mod', 'rand', 'speed', 'gravity', 'friction']),
  event: new Set(['msg', 'shake', 'sound', 'checkpoint', 'respawn', 'setpos', 'remove', 'patrol']),
};

const INPUT_KEYS = new Set([
  'left',
  'right',
  'up',
  'down',
  'space',
  'enter',
  'esc',
  'shift',
  'ctrl',
  'alt',
  'a',
  'd',
  'w',
  's',
  'z',
  'x',
  'c',
]);

const CONSTANTS = new Set([
  'PX',
  'PY',
  'VX',
  'VY',
  'TIME',
  'FRAME',
  'DT',
  'GROUND',
  'SPEED',
  'GRAVITY',
  'FRICTION',
  'HP',
  'SCORE',
  'STAGE',
  'BONUS',
]);

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap(cls: string, value: string) {
  return `<span class="${cls}">${escapeHtml(value)}</span>`;
}

function highlightLine(line: string) {
  let html = '';
  let i = 0;
  const firstNonSpace = line.search(/\S/);

  while (i < line.length) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '/' && next === '/') {
      html += wrap('wbw-comment', line.slice(i));
      break;
    }

    if (char === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') {
        j += 1;
      }
      const chunk = line.slice(i, j < line.length ? j + 1 : j);
      html += wrap('wbw-string', chunk);
      i = j < line.length ? j + 1 : j;
      continue;
    }

    if (char === '#' && /[0-9a-fA-F]/.test(next || '')) {
      let j = i + 1;
      while (j < line.length && /[0-9a-fA-F]/.test(line[j])) {
        j += 1;
      }
      html += wrap('wbw-color', line.slice(i, j));
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_-]/.test(line[j])) {
        j += 1;
      }
      const word = line.slice(i, j);
      const lower = word.toLowerCase();
      if (i === firstNonSpace && line[j] === ':') {
        html += wrap('wbw-label', `${word}:`);
        i = j + 1;
        continue;
      }
      if (GROUPS.core.has(lower)) {
        html += wrap('wbw-core', word);
      } else if (GROUPS.input.has(lower)) {
        html += wrap('wbw-input', word);
      } else if (GROUPS.flow.has(lower)) {
        html += wrap('wbw-flow', word);
      } else if (GROUPS.math.has(lower)) {
        html += wrap('wbw-math', word);
      } else if (GROUPS.event.has(lower)) {
        html += wrap('wbw-event', word);
      } else if (INPUT_KEYS.has(lower)) {
        html += wrap('wbw-key', word);
      } else if (CONSTANTS.has(word) || (word === word.toUpperCase() && /^[A-Z0-9_]+$/.test(word))) {
        html += wrap('wbw-constant', word);
      } else {
        html += wrap('wbw-identifier', word);
      }
      i = j;
      continue;
    }

    if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(next || ''))) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) {
        j += 1;
      }
      html += wrap('wbw-number', line.slice(i, j));
      i = j;
      continue;
    }

    html += escapeHtml(char);
    i += 1;
  }

  return html;
}

function highlightWBW(code: string) {
  const safe = code.replace(/\r\n/g, '\n');
  if (!safe) return '';
  return safe.split('\n').map(highlightLine).join('\n');
}

export default function WBWEditor({ value, onChange, readOnly = false }: WBWEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighted = useMemo(() => highlightWBW(value), [value]);

  const syncScroll = () => {
    if (!preRef.current || !textareaRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  useEffect(() => {
    syncScroll();
  }, [highlighted]);

  return (
    <div className="wbw-editor-wrap">
      <pre ref={preRef} className="wbw-editor-highlight" aria-hidden="true">
        <code dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? '\n' : '') }} />
      </pre>
      {!readOnly && !value && (
        <div className="wbw-editor-placeholder">// Write WBW code here...</div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        className="wbw-editor wbw-editor-input"
        spellCheck={false}
        readOnly={readOnly}
      />
    </div>
  );
}
