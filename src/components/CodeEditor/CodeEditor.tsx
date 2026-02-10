import React, { useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useTheme } from '../../hooks/useTheme';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const { resolvedTheme } = useTheme();

  const isLanguageRegistered = useRef(false);

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
    wordWrap: 'on', 
    wrappingStrategy: 'advanced',
  } as const;

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    if (!isLanguageRegistered.current) {
      monaco.languages.register({ id: 'molic' });

      monaco.languages.setMonarchTokensProvider('molic', {
        tokenizer: {
          root: [
            // Keywords principais
            [/\b(scene|global|dialog)\b/, 'keyword'],
            
            // Controles de fluxo
            [/\b(seq|xor|or|if|when)\b/, 'keyword.flow'],
            
            // Propriedades
            [/\b(topic|u|d|du)(?=:)/, 'type.identifier'], 
            
            // Setas
            [/->|\.\.>/, 'operator'],

            // Strings
            [/"/,  { token: 'string.quote', bracket: '@open', next: '@stringDouble' }],
            [/'/,  { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],

            // Comentários
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            
            // Delimitadores
            [/[{}]/, 'delimiter.bracket'],
          ],

          stringDouble: [
            [/[^\\"]+/, 'string'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],

          stringSingle: [
            [/[^\\']+/, 'string'],
            [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],

          comment: [
            [/[^/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[/*]/, 'comment']
          ]
        }
      });

      isLanguageRegistered.current = true;
    }

    monaco.editor.defineTheme('molic-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#C586C0', fontStyle: 'bold' },
        { token: 'keyword.flow', foreground: '#569CD6' },         
        { token: 'type.identifier', foreground: '#4EC9B0' },  
        { token: 'string', foreground: '#CE9178' },         
        { token: 'comment', foreground: '#6A9955', fontStyle: 'italic' },
        { token: 'operator', foreground: '#D4D4D4' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#333333',
      }
    });
    
    monaco.editor.defineTheme('molic-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#AF00DB', fontStyle: 'bold' },
        { token: 'keyword.flow', foreground: '#0000FF' },
        { token: 'type.identifier', foreground: '#0070C1' },
        { token: 'string', foreground: '#A31515' },
        { token: 'comment', foreground: '#008000', fontStyle: 'italic' },
        { token: 'operator', foreground: '#000000' },
      ],
      colors: {
        'editor.background': '#ffffff', 
        'editor.lineHighlightBackground': '#e0e0e0',
      }
    });
    
    monaco.editor.setTheme(resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light');
    
    editor.focus();
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        defaultLanguage="molic" 
        language="molic"
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