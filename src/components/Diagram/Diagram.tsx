import React from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  type Node, 
  type Edge, 
  type OnNodesChange, 
  type OnEdgesChange,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../../hooks/UseTheme';

interface DiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
}

export const Diagram: React.FC<DiagramProps> = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange 
}) => {
  const { resolvedTheme } = useTheme();

  const gridColor = resolvedTheme === 'dark' ? '#333' : '#e0e0e0';

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        fitView
        style={{ backgroundColor: 'var(--bg-canvas)' }}
      >
        <Background 
          color={gridColor} 
          gap={20} 
          size={1} 
        />
        
        <Controls 
          style={{ 
            fill: 'var(--text-base)', 
            backgroundColor: 'var(--bg-base)',
            borderColor: 'var(--border-base)' 
          }} 
        />
      </ReactFlow>
    </div>
  );
};