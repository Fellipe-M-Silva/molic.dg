import { useState, useRef, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/main.css';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { ProblemsPanel } from './components/ProblemsPanel/ProblemsPanel';
import { Diagram } from './components/Diagram/Diagram';
import { useValidation } from './hooks/useValidation';
import { ThemeProvider } from './providers/ThemeProvider';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

export const INITIAL_CODE = ``;

function AppContent() {
  const [code, setCode] = useState(() => {
    return localStorage.getItem('molic-code') || INITIAL_CODE;
  });

  const [editorVisible, setEditorVisible] = useState(true);
  const [editorWidth, setEditorWidth] = useState(() => {
    const saved = localStorage.getItem('molic-editor-width');
    return saved ? Number(saved) : 360; // Padrão: 360px
  });
  const [isResizing, setIsResizing] = useState(false);
  const editorPaneRef = useRef<HTMLDivElement>(null);

  // Validação com debounce
  const error = useValidation(code, 800);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem('molic-code', newCode);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleDoubleClick = () => {
    setEditorWidth(360); // Reset para padrão
    localStorage.setItem('molic-editor-width', '360');
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !editorPaneRef.current) return;

      const workspace = editorPaneRef.current.parentElement;
      if (!workspace) return;

      const workspaceRect = workspace.getBoundingClientRect();
      const newWidth = e.clientX - workspaceRect.left;

      // Snap point: 360px
      const snapPoint = 360;
      const constrained = Math.max(200, Math.min(800, newWidth)); // Mínimo 200px, máximo 800px

      // Se estiver perto do snap point (30px), snap para ele
      if (Math.abs(snapPoint - constrained) < 30) {
        setEditorWidth(snapPoint);
        localStorage.setItem('molic-editor-width', '360');
      } else {
        setEditorWidth(constrained);
        localStorage.setItem('molic-editor-width', constrained.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Keyboard shortcut para toggle editor (E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // Verificar se não está focado em um input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setEditorVisible(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1 style={{ marginRight: '10px' }}>MoLIC.dg</h1>
        <div style={{ flex: 1 }} />
        {error ? (
          <span style={{
            fontSize: '0.8rem',
            color: '#ff4d4f',
            background: 'rgba(255, 0, 0, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            Erro de Sintaxe
          </span>
        ) : (
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--primary)',
            background: 'rgba(0, 255, 0, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            Compilado
          </span>
        )}

        <ThemeToggle />
      </header>

      <main className="workspace">
        <aside 
          ref={editorPaneRef}
          className={`editor-pane${editorVisible ? '' : ' hidden'}`}
          style={{
            width: editorVisible ? `${editorWidth}px` : '0',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            cursor: isResizing ? 'col-resize' : 'default',
          }}
        >
            <CodeEditor 
              code={code} 
              onChange={handleCodeChange}
              errors={error ? [error] : []}
            />

            {error && <ProblemsPanel errors={[error]} />}

            {/* Handle de Resize */}
            <div
              className="resize-handle"
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              title="Arraste para redimensionar | Double-click para reset"
            />

          {/* Botão de Ocultar */}
          <button
            className="editor-toggle-btn hide"
            onClick={() => setEditorVisible(false)}
            title="Ocultar editor (E)"
          >
            <CaretLeftIcon size={16} weight="bold" />
          </button>
        </aside>

        {/* Botão de Mostrar (flutuante) */}
        {!editorVisible && (
          <button
            className="editor-toggle-btn show"
            onClick={() => setEditorVisible(true)}
            title="Mostrar editor (E)"
          >
            <CaretRightIcon size={16} weight="bold" />
          </button>
        )}

        <div className="diagram-pane">
          <Diagram code={code} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ReactFlowProvider>
        <AppContent />
      </ReactFlowProvider>
    </ThemeProvider>
  );
}