import React from 'react';

// This is a placeholder for a custom WBW editor. In production, use Monaco/CodeMirror with a WBW syntax highlighter.
type WBWEditorProps = {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
};

export default function WBWEditor({ value, onChange, readOnly = false }: WBWEditorProps) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className="flex-1 bg-black text-wbw font-mono text-sm p-4 resize-none focus:outline-none border-0 wbw-editor"
      spellCheck={false}
      readOnly={readOnly}
      style={{ color: '#aaff55', background: '#181c1f', fontFamily: 'Fira Mono, monospace' }}
      placeholder={readOnly ? undefined : '// Write WBW code here...'}
    />
  );
}
