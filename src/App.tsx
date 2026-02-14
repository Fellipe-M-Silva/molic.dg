import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/main.css';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { ProblemsPanel } from './components/ProblemsPanel/ProblemsPanel';
import { Diagram } from './components/Diagram/Diagram';
import { useValidation } from './hooks/useValidation';
import { ThemeProvider } from './providers/ThemeProvider';

export const INITIAL_CODE = ``;

function AppContent() {
  const [code, setCode] = useState(() => {
    return localStorage.getItem('molic-code') || INITIAL_CODE;
  });

  // Validação com debounce
  const error = useValidation(code, 800);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem('molic-code', newCode);
  };

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
        <aside className="editor-pane" style={{
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-base)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CodeEditor 
            code={code} 
            onChange={handleCodeChange}
            errors={error ? [error] : []}
          />

          {error && <ProblemsPanel errors={[error]} />}
        </aside>

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