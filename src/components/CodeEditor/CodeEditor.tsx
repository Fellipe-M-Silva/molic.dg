/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useTheme } from '../../hooks/useTheme';
import { molicConfiguration, molicLanguage } from '../../core/molicLanguage';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const { resolvedTheme } = useTheme();
  const isLanguageRegistered = useRef(false);
  const monacoRef = useRef<any>(null);

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: 24,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
    wordWrap: 'on', 
    wrappingStrategy: 'advanced',
    tabSize: 2,
  } as const;

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;

    // 1. Registrar a linguagem apenas uma vez
    if (!isLanguageRegistered.current) {
      monaco.languages.register({ id: 'molic' });
      
      // Usa as definições importadas do molicLanguage.ts
      monaco.languages.setMonarchTokensProvider('molic', molicLanguage);
      monaco.languages.setLanguageConfiguration('molic', molicConfiguration);

      isLanguageRegistered.current = true;
    }

    // 2. Definir o Tema Escuro (Dark)
    monaco.editor.defineTheme('molic-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Keywords principais (scene, process, start...) - Roxo/Rosa
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        
        // Fluxos (xor, seq, if...) - Laranja/Salmão
        { token: 'keyword.flow', foreground: 'CE9178', fontStyle: 'italic' },
        
        // Atributos (topic, role, let...) - Azul Claro
        { token: 'keyword.attribute', foreground: '9CDCFE' },
        
        // Speakers (u, d, du) - Amarelo (Fácil identificação)
        { token: 'keyword.speaker', foreground: 'DCDCAA', fontStyle: 'bold' },
        
        // Strings - Verde
        { token: 'string', foreground: '6A9955' },
        
        // Comentários - Cinza/Verde escuro
        { token: 'comment', foreground: '608B4E', fontStyle: 'italic' },
        
        // Operadores (->) - Cinza Claro
        { token: 'operator', foreground: 'D4D4D4' },
        
        // Identificadores inválidos ou desconhecidos
        { token: 'identifier', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#333333',
        'editor.selectionBackground': '#264F78',
      }
    });

    // 3. Definir o Tema Claro (Light)
    monaco.editor.defineTheme('molic-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'AF00DB', fontStyle: 'bold' },
        { token: 'keyword.flow', foreground: '0000FF', fontStyle: 'italic' },
        { token: 'keyword.attribute', foreground: '0070C1' },
        { token: 'keyword.speaker', foreground: '795E26', fontStyle: 'bold' },
        { token: 'string', foreground: 'A31515' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'operator', foreground: '000000' },
      ],
      colors: {
        'editor.background': '#ffffff', 
        'editor.lineHighlightBackground': '#e0e0e0',
      }
    });
    
    // Aplica o tema inicial
    monaco.editor.setTheme(resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light');
    
    editor.focus();
  };

  // Atualiza o tema se mudar fora do editor (ex: botão de tema da UI)
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light');
    }
  }, [resolvedTheme]);

  return (
    <div style={{ height: '100%', width: '100%' }} onKeyDown={(e) => e.stopPropagation()}>
      <Editor
        height="100%"
        defaultLanguage="molic" 
        language="molic"
        theme={resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light'}
        value={code}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={editorOptions}
        loading={
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--text-muted)' 
          }}>
            Carregando editor...
          </div>
        }
      />
    </div>
  );
};