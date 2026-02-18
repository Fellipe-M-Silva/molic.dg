/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
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
  const isInsertingSnippetRef = useRef(false);
  const autoSnippetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    quickSuggestions: { other: true, comments: false, strings: true },
    suggestOnTriggerCharacters: true,
    snippetSuggestions: 'top',
    tabCompletion: 'on',
    acceptSuggestionOnEnter: 'on',
    scrollbar: { useShadows: true, vertical: 'auto', horizontal: 'auto' },
  } as const;

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const autoRules: Array<{
      pattern: RegExp;
      build: (match: RegExpMatchArray) => string;
      label: string;
    }> = [
      {
        pattern: /\b(u|d|du|anon)(if|when)?(t|r|s)$/,
        label: 'utterance transition',
        build: (match) => {
          const speaker = match[1];
          const conditionType = match[2];
          const transitionType = match[3];
          const arrow = transitionType === 'r' ? '..>' : transitionType === 's' ? '=>' : '->';
          const needsCondition = conditionType === 'if' || conditionType === 'when';
          const conditionLabel = conditionType === 'when' ? 'when' : 'if';

          const scenePlaceholder = (index: number) => '${' + index + ':Cena}';

          if (speaker === 'du') {
            const base = 'du: ' + '${1:campo1}' + ', ' + '${2:campo2}';
            const condition = needsCondition
              ? ' ' + conditionLabel + ': "' + '${3:condicao}' + '"'
              : '';
            const sceneIndex = needsCondition ? 4 : 3;
            return base + condition + ' ' + arrow + ' ' + scenePlaceholder(sceneIndex);
          }

          const speakerLabel = speaker === 'anon' ? 'anon' : speaker;
          const base = speakerLabel + ': "' + '${1:Mensagem}' + '"';
          const condition = needsCondition
            ? ' ' + conditionLabel + ': "' + '${2:condicao}' + '"'
            : '';
          const sceneIndex = needsCondition ? 3 : 2;
          return base + condition + ' ' + arrow + ' ' + scenePlaceholder(sceneIndex);
        },
      },
      {
        pattern: /\b(u|d|du)if$/,
        label: 'utterance with if',
        build: (match) => {
          const speaker = match[1];
          if (speaker === 'du') {
            return 'du: ${1:campo1}, ${2:campo2} if: "${3:condicao}"';
          }
          return speaker + ': "${1:Fala}" if: "${2:condicao}"';
        },
      },
      {
        pattern: /\bifeff$/,
        label: 'anonymous with if/effect',
        build: () => 'anon: "${1:Texto}" if: "${2:condicao}" effect: "${3:efeito}"',
      },
      {
        pattern: /\bstartt$/,
        label: 'start with user transition',
        build: () => 'start ${1:StartId} {\n\tu: "${2:Mensagem}" -> ${3:Cena}\n}',
      },
      {
        pattern: /\b(and|or|xor|seq)$/,
        label: 'flow with dialog',
        build: (match) => {
          const flow = match[1];
          return flow + ' {\n\tsubtopic: "${1:Subtopico}"\n\t${0}\n}';
        },
      },
      {
        pattern: /\bprocfork$/,
        label: 'process + fork + ext',
        build: () =>
          'process ${1:ProcessId} {\n\td: "${2:Troca}" -> ${3:ForkId}\n\td: "${4:Recuperacao}" ..> ${3:ForkId}\n}\n\nfork ${3:ForkId} {\n\t${5:SceneId}\n\t${6:ExtId}\n}\n\nexternal ${6:ExtId}',
      },
    ];

    if (!isLanguageRegistered.current) {
      monaco.languages.register({ id: 'molic' });
      monaco.languages.setMonarchTokensProvider('molic', molicLanguage);
      monaco.languages.setLanguageConfiguration('molic', molicConfiguration);

      const getList = (value: unknown): string[] =>
        Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

      const nodeTypes = getList(molicLanguage.nodeTypes);
      const keywords = getList(molicLanguage.keywords);
      const flowKeywords = getList(molicLanguage.flowKeywords);
      const clauses = getList(molicLanguage.clauses);
      const speakers = getList(molicLanguage.speakers);

      const keywordItems = [
        ...nodeTypes.map((word) => ({ label: word, kind: monaco.languages.CompletionItemKind.Keyword, insertText: word })),
        ...keywords.map((word) => ({ label: word, kind: monaco.languages.CompletionItemKind.Keyword, insertText: word })),
        ...flowKeywords.map((word) => ({ label: word, kind: monaco.languages.CompletionItemKind.Keyword, insertText: word })),
        ...clauses.map((word) => ({ label: `${word}:`, kind: monaco.languages.CompletionItemKind.Keyword, insertText: `${word}: ` })),
        ...speakers.map((word) => ({ label: `${word}:`, kind: monaco.languages.CompletionItemKind.Keyword, insertText: `${word}: ` })),
      ];

      const normalizedTransitionSnippets: Monaco.languages.CompletionItem[] = [];

      const baseSnippets = [
        {
          label: 'Cena (scene)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'scene ${1:Name} {\n\ttopic: "${2:Titulo}"\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: scen',
          filterText: 'scen',
          sortText: '01',
        },
        {
          label: 'Mudança de tópico global (global)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'global ${1:Name} {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Cria um bloco global.',
        },
        {
          label: 'Ponto de abertura (start)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'start ${1:StartId} {\n\tu: "${2:Mensagem}" -> ${3:Cena}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: star',
          filterText: 'star',
          sortText: '01',
        },
        {
          label: 'Cena inicial (start + scene)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'start ${1:StartId} {\n\tu: "${2:Mensagem}" -> ${3:SceneId}\n}\n\nscene ${3:SceneId} {\n\ttopic: "${4:Topico}"\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: stsc',
          filterText: 'stsc',
          sortText: '01',
        },
        {
          label: 'Processo de sistema (process)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'process ${1:ProcessId} {\n\td: "${2:Troca}" -> ${3:Destino}\n\td: "${4:Recuperacao}" ..> ${3:Destino}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: proc',
          filterText: 'proc',
          sortText: '01',
        },
        {
          label: 'Interlocutor externo (external)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'external ${1:ExternalId}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: exte',
          filterText: 'exte',
          sortText: '01',
        },
        {
          label: 'Ponto de contato (contact)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'contact ${1:ContactId} {\n\trole: "${2:Suporte}"\n\t: "${3:Mensagem}" -> ${4:Destino}\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: cont',
          filterText: 'cont',
          sortText: '01',
        },
        {
          label: 'Bifurcação (fork)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'fork ${1:ForkId} {\n\td: "${2:TrocaCena}" -> ${3:SceneId}\n\td: "${4:TrocaExt}" -> ${5:ExtId}\n}\n\nexternal ${5:ExtId}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Atalho: fork',
          filterText: 'fork',
          sortText: '01',
        },
        {
          label: 'Processo com bifurcação (procfork)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'process ${1:ProcessId} {\n\td: "${2:Troca}" -> ${3:ForkId}\n}\n\nfork ${3:ForkId} {\n\td: "${4:TrocaCena}" -> ${5:SceneId}\n\td: "${6:TrocaExt}" -> ${7:ExtId}\n}\n\nexternal ${7:ExtId}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: 'procfork',
          sortText: '01',
        },
        {
          label: 'Diálogo SEQ (seq)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'seq {\n\tsubtopic: "${1:Subtopico}"\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: 'sequ',
          sortText: '01',
        },
        {
          label: 'Diálogo XOR (xor)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'xor {\n\tsubtopic: "${1:Subtopico}"\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: 'xord',
          sortText: '01',
        },
        {
          label: 'Diálogo OR (or)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'or {\n\tsubtopic: "${1:Subtopico}"\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: 'ordi',
          sortText: '01',
        },
        {
          label: 'Diálogo AND (and)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'and {\n\tsubtopic: "${1:Subtopico}"\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: 'andi',
          sortText: '01',
        },
        {
          label: 'topic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'topic: "${1:Titulo}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'subtopic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'subtopic: "${1:Subtitulo}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Fala de transição (usuário)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'u: "${1:Mensagem}" -> ${2:Cena}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Fala de transição (designer)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'd: "${1:Mensagem}" -> ${2:Cena}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Fala (designer + usuáiro)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'du: "${1:Mensagem}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Fala condicional (uif)',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'u: "${1:Mensagem}" if: "${2:condicao}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: 'uif',
          sortText: '00',
        },
        {
          label: 'Cláusula: if',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if: "${1:condicao}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Cláusula: when',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'when: "${1:evento}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Cláusula: why',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'why: "${1:motivo}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Cláusula: effect',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'effect: "${1:efeito}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'Cláusula: let',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'let: "${1:valor}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
      ];

      const snippets = [...baseSnippets, ...normalizedTransitionSnippets];

      monaco.languages.registerCompletionItemProvider('molic', {
        triggerCharacters: [':', '>', '.', '"', '='],
        provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
          const lineText = model.getLineContent(position.lineNumber);
          const prefix = lineText.slice(0, position.column - 1);
          const word = model.getWordUntilPosition(position);
          const fallbackRange = new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
          );

          const isSceneDeclaration = /^\s*scene\s+[^\s{]*$/.test(prefix);
          if (isSceneDeclaration) {
            return { suggestions: [] };
          }

          const rule = autoRules.find((item) => item.pattern.test(prefix));
          if (rule) {
            const match = prefix.match(rule.pattern);
            if (match) {
              const startColumn = prefix.length - match[0].length + 1;
              const range = new monaco.Range(
                position.lineNumber,
                startColumn,
                position.lineNumber,
                position.column,
              );
              return {
                suggestions: [
                  {
                    label: rule.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: rule.build(match),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                  },
                ],
              };
            }
          }

          const transitionMatch = prefix.match(/(?:->|\.\.>|=>)\s*([\w-]*)$/);
          if (transitionMatch) {
            const sceneNames = Array.from(
              new Set(
                Array.from(model.getValue().matchAll(/^\s*scene\s+([A-Za-z_][\w-]*)/gm)).map(
                  (match) => match[1],
                ),
              ),
            );
            const startColumn = position.column - transitionMatch[1].length;
            const range = new monaco.Range(
              position.lineNumber,
              startColumn,
              position.lineNumber,
              position.column,
            );
            return {
              suggestions: sceneNames.map((scene) => ({
                label: scene,
                kind: monaco.languages.CompletionItemKind.Reference,
                insertText: scene,
                range,
              })),
            };
          }

          return {
            suggestions: [...snippets, ...keywordItems].map((item) => ({
              ...item,
              range: fallbackRange,
            })),
          };
        },
      });

      isLanguageRegistered.current = true;
    }

    monaco.editor.defineTheme('molic-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Tipos de no (scene, global, fork, process, external, contact)
        { token: 'keyword.struct', foreground: 'DA70D6', fontStyle: 'bold' },
        { token: 'keyword.clause', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'keyword.flow', foreground: 'CE9178', fontStyle: 'italic' },
        { token: 'keyword.speaker', foreground: 'DCDCAA', fontStyle: 'bold' },
        { token: 'operator.arrow', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'string', foreground: '6A9955' },
        { token: 'comment', foreground: '608B4E', fontStyle: 'italic' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'identifier', foreground: 'D4D4D4' },
        { token: 'number', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editor.selectionBackground': '#264F78',
      },
    });

    monaco.editor.defineTheme('molic-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword.struct', foreground: 'A4009B', fontStyle: 'bold' },
        { token: 'keyword.clause', foreground: '008000', fontStyle: 'bold' },
        { token: 'keyword', foreground: 'AF00DB', fontStyle: 'bold' },
        { token: 'keyword.flow', foreground: '0000FF', fontStyle: 'italic' },
        { token: 'keyword.speaker', foreground: 'BF7F3C', fontStyle: 'bold' },
        { token: 'operator.arrow', foreground: '008000', fontStyle: 'bold' },
        { token: 'string', foreground: 'A31515' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'operator', foreground: '000000' },
        { token: 'identifier', foreground: '000000' },
        { token: 'number', foreground: '000000' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f0f0f0',
        'editor.selectionBackground': '#ADD6FF',
      },
    });

    monaco.editor.setTheme(resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light');

    const applyAutoSnippets = () => {
      if (isInsertingSnippetRef.current) return;
      const model = editor.getModel();
      const position = editor.getPosition();
      if (!model || !position) return;

      const lineText = model.getLineContent(position.lineNumber);
      const prefix = lineText.slice(0, position.column - 1);

      const rule = autoRules.find((item) => item.pattern.test(prefix));
      if (!rule) return;

      const match = prefix.match(rule.pattern);
      if (!match) return;

      const startColumn = prefix.length - match[0].length + 1;
      const endColumn = position.column;
      const snippet = rule.build(match);

      isInsertingSnippetRef.current = true;
      editor.trigger('keyboard', 'editor.action.insertSnippet', {
        snippet,
        range: new monaco.Range(position.lineNumber, startColumn, position.lineNumber, endColumn),
      });
      isInsertingSnippetRef.current = false;
    };

    editor.onDidChangeModelContent((event) => {
      if (event.isFlush || event.isRedoing || event.isUndoing) return;
      
      // Debounce auto-snippets para evitar múltiplas inserções quando digitando rápido
      if (autoSnippetTimeoutRef.current) {
        clearTimeout(autoSnippetTimeoutRef.current);
      }
      
      autoSnippetTimeoutRef.current = setTimeout(() => {
        applyAutoSnippets();
        autoSnippetTimeoutRef.current = null;
      }, 100); // Aguarda 100ms após o último input antes de aplicar snippets
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
    });

    editor.focus();
  };

  // Atualiza o tema se mudar fora do editor (ex: botão de tema da UI ou localStorage.clear())
  useEffect(() => {
    if (monacoRef.current) {
      const newTheme = resolvedTheme === 'dark' ? 'molic-dark' : 'molic-light';
      monacoRef.current.editor.setTheme(newTheme);
    }
  }, [resolvedTheme]);

  // Limpa o timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (autoSnippetTimeoutRef.current) {
        clearTimeout(autoSnippetTimeoutRef.current);
      }
    };
  }, []);

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
