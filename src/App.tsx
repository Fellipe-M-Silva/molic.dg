import { useEffect, useState } from 'react';
import { useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/main.css';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Diagram } from './components/Diagram/Diagram';

// mockado
const mockParser = (codeText: string) => {
  // Lógica fake: Se o código tiver a palavra "login", mostra 2 nós.
  // Se não, mostra apenas 1.
  if (codeText.includes('login')) {
    return {
      nodes: [
        { id: '1', data: { label: 'Cena Inicial' }, position: { x: 250, y: 5 } },
        { id: '2', data: { label: 'Menu Principal' }, position: { x: 100, y: 100 } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', label: 'u: login' }
      ]
    };
  }
  
  // Estado padrão (apenas 1 nó)
  return {
    nodes: [{ id: '1', data: { label: 'Cena Vazia' }, position: { x: 250, y: 5 } }],
    edges: []
  };
};


function App() {
  const [code, setCode] = useState('// Digite seu código MoLIC aqui...');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    console.log("Código mudou! Rodando parser...");
    
    const { nodes: newNodes, edges: newEdges } = mockParser(code);

    setNodes(newNodes);
    setEdges(newEdges);

  }, [code, setNodes, setEdges]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>MoLIC Studio</h1>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
      </header>
      
      <main className="workspace">
        <aside className="editor-pane">
          <CodeEditor code={code} onChange={setCode} />
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

export default App;