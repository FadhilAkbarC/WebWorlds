import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeWBWCode } from '@/engine/wbw-game-engine';

type WBWEditorProps = {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
};

type Diagnostic = {
  line: number;
  message: string;
  token?: string;
};

type TooltipState = {
  visible: boolean;
  message: string;
  top: number;
  left: number;
};

const GROUPS = {
  core: new Set([
    'player', 'spawn', 'enemy', 'item', 'coin', 'npc', 'platform', 'solid', 'tile', 'ledge', 'rect', 'box',
    'circle', 'line', 'tri', 'bg', 'color', 'pcolor', 'size', 'text', 'textsize', 'hud', 'uirect', 'uicircle',
    'uiline', 'button', 'uivisible', 'uienable', 'uicolor', 'removeui', 'clearui', 'world', 'cam', 'camfollow',
    'camlerp', 'camoffset', 'camclamp', 'camreset',
  ]),
  input: new Set([
    'on', 'onpress', 'onrelease', 'onui', 'onhoverui', 'move', 'jump', 'shoot', 'vel', 'push', 'setx', 'sety',
    'addx', 'addy', 'velx', 'vely', 'pushx', 'pushy', 'stopx', 'stopy', 'flipx', 'flipy', 'bouncex', 'bouncey',
    'setpos', 'teleport', 'sizeof', 'colorof',
  ]),
  flow: new Set(['if', 'ifnot', 'goto', 'loop', 'end', 'stop', 'after', 'every', 'canceltimer', 'cleartimers', 'exists', 'between']),
  math: new Set([
    'set', 'add', 'sub', 'mul', 'div', 'mod', 'rand', 'randint', 'randfloat', 'inc', 'dec', 'abs', 'neg',
    'sign', 'floor', 'ceil', 'round', 'min', 'max', 'clamp', 'pow', 'sqrt', 'log', 'exp', 'sin', 'cos', 'tan',
    'asin', 'acos', 'atan', 'atan2', 'lerp', 'mix', 'swap', 'copy', 'toggle', 'speed', 'gravity', 'friction',
    'clamp01', 'dist', 'len',
  ]),
  event: new Set([
    'msg', 'shake', 'sound', 'checkpoint', 'respawn', 'remove', 'patrol', 'onui', 'onhoverui', 'after', 'every',
    'canceltimer', 'cleartimers', 'concat', 'str', 'unset',
  ]),
};

const INPUT_KEYS = new Set(['left', 'right', 'up', 'down', 'space', 'enter', 'esc', 'shift', 'ctrl', 'alt', 'a', 'd', 'w', 's', 'z', 'x', 'c']);
const CONSTANTS = new Set(['PX', 'PY', 'VX', 'VY', 'TIME', 'FRAME', 'DT', 'GROUND', 'WORLDW', 'WORLDH', 'CAMX', 'CAMY', 'MX', 'MY', 'MOUSEDOWN', 'UIHOVER', 'UICLICK', 'SPEED', 'GRAVITY', 'FRICTION', 'HP', 'SCORE', 'STAGE', 'BONUS']);

const CHAR_WIDTH = 8.4;
const LINE_HEIGHT = 21;
const PADDING_X = 16;
const PADDING_Y = 16;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap(cls: string, value: string, extraClass?: string) {
  const classes = extraClass ? `${cls} ${extraClass}` : cls;
  return `<span class="${classes}">${escapeHtml(value)}</span>`;
}

function buildDiagnostics(code: string): Diagnostic[] {
  const errors = analyzeWBWCode(code);
  return errors.map((error) => {
    const unknown = error.message.match(/^Unknown command:\s*(.+)$/i);
    return {
      line: error.line,
      message: error.message,
      token: unknown ? unknown[1] : undefined,
    };
  });
}

function highlightLine(line: string, lineDiagnostic?: Diagnostic) {
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
      while (j < line.length && /[A-Za-z0-9_.-]/.test(line[j])) {
        j += 1;
      }
      const word = line.slice(i, j);
      const lower = word.toLowerCase();
      const hasTokenError = lineDiagnostic?.token && lineDiagnostic.token === word;
      const errorClass = hasTokenError ? 'wbw-error-token' : undefined;

      if (i === firstNonSpace && line[j] === ':') {
        html += wrap('wbw-label', `${word}:`, errorClass);
        i = j + 1;
        continue;
      }

      if (GROUPS.core.has(lower)) {
        html += wrap('wbw-core', word, errorClass);
      } else if (GROUPS.input.has(lower)) {
        html += wrap('wbw-input', word, errorClass);
      } else if (GROUPS.flow.has(lower)) {
        html += wrap('wbw-flow', word, errorClass);
      } else if (GROUPS.math.has(lower)) {
        html += wrap('wbw-math', word, errorClass);
      } else if (GROUPS.event.has(lower)) {
        html += wrap('wbw-event', word, errorClass);
      } else if (INPUT_KEYS.has(lower)) {
        html += wrap('wbw-key', word, errorClass);
      } else if (CONSTANTS.has(word) || (word === word.toUpperCase() && /^[A-Z0-9_]+$/.test(word))) {
        html += wrap('wbw-constant', word, errorClass);
      } else {
        html += wrap('wbw-identifier', word, errorClass);
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

  if (!lineDiagnostic || lineDiagnostic.token) {
    return html;
  }
  return `<span class="wbw-error-line">${html || '&nbsp;'}</span>`;
}

function highlightWBW(code: string, diagnostics: Map<number, Diagnostic>) {
  const safe = code.replace(/\r\n/g, '\n');
  if (!safe) return '';
  return safe
    .split('\n')
    .map((line, idx) => highlightLine(line, diagnostics.get(idx + 1)))
    .join('\n');
}

function getCaretLineColumn(code: string, index: number) {
  const safe = code.slice(0, index);
  const lines = safe.split('\n');
  return { line: lines.length, col: lines[lines.length - 1]?.length ?? 0 };
}

export default function WBWEditor({ value, onChange, readOnly = false }: WBWEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const holdTimerRef = useRef<number | null>(null);

  const analysisValue = useDeferredValue(value);
  const diagnostics = useMemo(() => buildDiagnostics(analysisValue), [analysisValue]);
  const diagnosticsByLine = useMemo(() => new Map(diagnostics.map((d) => [d.line, d])), [diagnostics]);
  const highlighted = useMemo(() => highlightWBW(analysisValue, diagnosticsByLine), [analysisValue, diagnosticsByLine]);

  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, message: '', top: 0, left: 0 });

  const syncScroll = () => {
    if (!preRef.current || !textareaRef.current) return;
    preRef.current.scrollTop = textareaRef.current.scrollTop;
    preRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  useEffect(() => {
    syncScroll();
  }, [highlighted]);

  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }));

  const showTooltipAtCaret = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const caret = textarea.selectionStart ?? 0;
    const { line, col } = getCaretLineColumn(value, caret);
    const issue = diagnosticsByLine.get(line);

    if (!issue) {
      hideTooltip();
      return;
    }

    if (issue.token) {
      const lineText = analysisValue.split(/\r?\n/)[line - 1] ?? '';
      const tokenStart = lineText.indexOf(issue.token);
      if (tokenStart >= 0) {
        const tokenEnd = tokenStart + issue.token.length;
        if (col < tokenStart || col > tokenEnd) {
          hideTooltip();
          return;
        }
      }
    }

    const left = Math.max(8, PADDING_X + col * CHAR_WIDTH - textarea.scrollLeft);
    const top = Math.max(8, PADDING_Y + (line - 1) * LINE_HEIGHT - textarea.scrollTop - 34);

    setTooltip({
      visible: true,
      message: issue.message,
      left,
      top,
    });
  };

  const handleTouchStart = () => {
    if (readOnly) return;
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      showTooltipAtCaret();
    }, 420);
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearHoldTimer();
    };
  }, []);

  return (
    <div className="wbw-editor-wrap">
      <pre ref={preRef} className="wbw-editor-highlight" aria-hidden="true">
        <code dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? '\n' : '') }} />
      </pre>
      {!readOnly && !value && <div className="wbw-editor-placeholder">Write WBW code here...</div>}
      {!readOnly && tooltip.visible && <div className="wbw-error-tooltip" style={{ top: tooltip.top, left: tooltip.left }}>{tooltip.message}</div>}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          hideTooltip();
        }}
        onScroll={() => {
          syncScroll();
          hideTooltip();
        }}
        onClick={showTooltipAtCaret}
        onKeyUp={showTooltipAtCaret}
        onSelect={showTooltipAtCaret}
        onBlur={hideTooltip}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearHoldTimer}
        onTouchMove={clearHoldTimer}
        className="wbw-editor wbw-editor-input"
        spellCheck={false}
        readOnly={readOnly}
      />
    </div>
  );
}
