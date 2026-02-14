/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useTheme } from '../../hooks/useTheme';
import { molicConfiguration, molicLanguage } from '../../core/molicLanguage';
import type { ParsingError } from '../../core/parser';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  errors?: ParsingError[];
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, errors = [] }) => {
  const { resolvedTheme } = useTheme();
  const isLanguageRegistered = useRef(false);
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

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
    editorRef.current = editor;
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
        // Tipos de nó (scene, global, fork, process, external, contact) - Roxo/Magenta
        { token: 'keyword.struct', foreground: 'DA70D6', fontStyle: 'bold' },
        
        // Cláusulas especiais (let:, why:, effect:, when:) - Azul/Ciano
        { token: 'keyword.clause', foreground: '4EC9B0', fontStyle: 'bold' },
        
        // Keywords estruturais (start, end, break, main) - Roxo mais suave
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        
        // Fluxos de controle (xor, seq, if, and, or) - Laranja/Salmão
        { token: 'keyword.flow', foreground: 'CE9178', fontStyle: 'italic' },
        
        // Speakers (u, d, du) - Amarelo (Fácil identificação)
        { token: 'keyword.speaker', foreground: 'DCDCAA', fontStyle: 'bold' },
        
        // Transições (-> e ..>) - Verde água
        { token: 'operator.arrow', foreground: '4EC9B0', fontStyle: 'bold' },
        
        // Strings - Verde
        { token: 'string', foreground: '6A9955' },
        
        // Comentários - Cinza/Verde escuro
        { token: 'comment', foreground: '608B4E', fontStyle: 'italic' },
        
        // Operadores (= :) - Cinza Claro
        { token: 'operator', foreground: 'D4D4D4' },
        
        // Identificadores (nomes de nós, variáveis)
        { token: 'identifier', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editor.selectionBackground': '#264F78',
      }
    });

    // 3. Definir o Tema Claro (Light)
    monaco.editor.defineTheme('molic-light', {
      base: 'vs',
      inherit: true,
      rules: [
        // Tipos de nó - Magenta
        { token: 'keyword.struct', foreground: 'A4009B', fontStyle: 'bold' },
        
        // Cláusulas especiais - Verde escuro
        { token: 'keyword.clause', foreground: '008000', fontStyle: 'bold' },
        
        // Keywords estruturais - Roxo
        { token: 'keyword', foreground: 'AF00DB', fontStyle: 'bold' },
        
        // Fluxos - Azul
        { token: 'keyword.flow', foreground: '0000FF', fontStyle: 'italic' },
        
        // Speakers - Marrom
        { token: 'keyword.speaker', foreground: 'BF7F3C', fontStyle: 'bold' },
        
        // Transições - Verde escuro
        { token: 'operator.arrow', foreground: '008000', fontStyle: 'bold' },
        
        // Strings - Vermelho escuro
        { token: 'string', foreground: 'A31515' },
        
        // Comentários - Verde
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        
        // Operadores - Preto
        { token: 'operator', foreground: '000000' },
        
        // Identificadores
        { token: 'identifier', foreground: '000000' },
      ],
      colors: {
        'editor.background': '#ffffff', 
        'editor.lineHighlightBackground': '#f0f0f0',
        'editor.selectionBackground': '#ADD6FF',
      }
    });
    
    // Aplica o tema inicial
    monaco.editor.setTheme(resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light');
    
    editor.focus();
  };

  // Atualiza o tema se mudar fora do editor (ex: botão de tema da UI ou localStorage.clear())
  useEffect(() => {
    if (monacoRef.current) {
      const newTheme = resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light';
      monacoRef.current.editor.setTheme(newTheme);
    }
  }, [resolvedTheme]);

  // Marca os erros no editor usando Monaco markers
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const markers = errors.map((error) => ({
          severity: monacoRef.current.MarkerSeverity.Error,
          startLineNumber: error.line,
          startColumn: error.column,
          endLineNumber: error.line,
          endColumn: error.column + 1,
          message: error.message,
        }));
        monacoRef.current.editor.setModelMarkers(model, 'molic', markers);
      }
    }
  }, [errors]);

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