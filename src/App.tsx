import { useState } from 'react';
import { ReactFlowProvider, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/main.css';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Diagram } from './components/Diagram/Diagram';
import { transformer } from './core/transformer';
import { parseMolic } from './core/parser';
import { ThemeProvider } from './providers/ThemeProvider';

const INITIAL_CODE = `
// Exemplo: Sistema de Login
scene login {
  topic: "Acesso ao Sistema"
  
  // Agrupamento sequencial
  seq {
    du: usuario, senha
    u: "entrar" -> home
  }

  u: "esqueci a senha" -> recuperarSenha
}

scene home {
  topic: "Dashboard"
  u: "sair" -> login
}

scene recuperarSenha {
  topic: "Recuperação"
  d: "email enviado" -> login
  u: "cancelar" ..> login // ..> cria seta tracejada (repair)
}
`;

const initialParse = parseMolic(INITIAL_CODE);
const initialData = initialParse.ast ? transformer(initialParse.ast) : { nodes: [], edges: [] };


function AppContent() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [error, setError] = useState<string | null>(initialParse.error);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    const { ast, error: parseError } = parseMolic(newCode);

    if (parseError) {
      setError(parseError);
      return;
    }

    setError(null);

    if (ast) {
      const { nodes: newNodes, edges: newEdges } = transformer(ast);
      setNodes(newNodes);
      setEdges(newEdges);
    }
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
          <CodeEditor code={code} onChange={handleCodeChange} />
          
          {error && (
            <div style={{ 
              padding: '10px', 
              background: 'var(--bg-alt)', 
              borderTop: '1px solid var(--border-muted)',
              color: '#ff4d4f',
              fontSize: '0.85rem',
              maxHeight: '100px',
              overflowY: 'auto',
              fontFamily: 'monospace'
            }}>
              {error}
            </div>
          )}
        </aside>

        <div className="diagram-pane">
          <Diagram
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange} />
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