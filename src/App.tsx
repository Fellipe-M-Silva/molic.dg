import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlowProvider, useEdgesState, useNodesState, type Connection, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/main.css';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Diagram } from './components/Diagram/Diagram';
import { transformer } from './core/transformer';
import { parseMolic } from './core/parser';
import { ThemeProvider } from './providers/ThemeProvider';
import { useLayoutPersistence } from './hooks/useLayoutPersistence';

export const INITIAL_CODE = ``;

function AppContent() {
  const { saveLayout, applySavedLayout } = useLayoutPersistence();
  const isFirstRender = useRef(true);

  const [code, setCode] = useState(() => {
    return localStorage.getItem('molic-code') || INITIAL_CODE;
  });

  const initialParse = parseMolic(code);
  const rawData = initialParse.ast ? transformer(initialParse.ast) : { nodes: [], edges: [] };
  
  const mergedData = applySavedLayout(rawData.nodes, rawData.edges);

  const [error, setError] = useState<string | null>(initialParse.error);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(mergedData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mergedData.edges);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem('molic-code', newCode); 

    const { ast, error: parseError } = parseMolic(newCode);

    if (parseError) {
      setError(parseError);
      return;
    }
    setError(null);

    if (ast) {
      const { nodes: newNodes, edges: newEdges } = transformer(ast);

      const finalData = applySavedLayout(newNodes, newEdges);
      
      setNodes(finalData.nodes);
      setEdges(finalData.edges);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (nodes.length === 0) return;

    const timeoutId = setTimeout(() => {
      saveLayout(nodes, edges);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, saveLayout]); 

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const isSameSourceNode = oldEdge.source === newConnection.source;
      const isSameTargetNode = oldEdge.target === newConnection.target;
      if (!isSameSourceNode || !isSameTargetNode) return;

      setEdges((els) =>
        els.map((e) => {
          if (e.id === oldEdge.id) {
            return {
              ...e,
              sourceHandle: newConnection.sourceHandle,
              targetHandle: newConnection.targetHandle,
            };
          }
          return e;
        })
      );
    },
    [setEdges]
  );

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
            onEdgesChange={onEdgesChange}
            onReconnect={onReconnect}/>
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