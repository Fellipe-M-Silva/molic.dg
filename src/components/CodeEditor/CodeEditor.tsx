import React from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useTheme } from '../../hooks/UseTheme';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const { resolvedTheme } = useTheme();

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: 24,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
  } as const;

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {    
    monaco.editor.defineTheme('molic-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#333333',
      }
    });
    
    monaco.editor.defineTheme('molic-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff', 
        'editor.lineHighlightBackground': '#e0e0e0',
      }
    });
    
    editor.focus();
};

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript" // molic depois
        theme={resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light'}
        value={code}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={editorOptions}
        loading={<div style={{ padding: 20, color: 'var(--text-muted)' }}>Carregando editor...</div>}
      />
    </div>
  );
};