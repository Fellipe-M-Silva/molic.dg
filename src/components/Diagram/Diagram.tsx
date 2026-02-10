import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  type Node, 
  type Edge, 
  type OnNodesChange, 
  type OnEdgesChange,
  ConnectionMode,
  type Connection,
  type OnConnectStart,
  type OnConnectEnd,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../../hooks/useTheme';
import { MolicNode } from './MolicNode';
import { CompletionNode, ContactNode, EndNode, ExternalNode, ForkNode, ProcessNode, StartNode } from './SpecialNodes';
interface DiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
}

export const Diagram: React.FC<DiagramProps> = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onReconnect,
}) => {
  const { resolvedTheme } = useTheme();

  const gridColor = resolvedTheme === 'dark' ? '#333' : '#e0e0e0';

  const nodeTypes = useMemo(() => ({
    molicNode: MolicNode,
    startNode: StartNode,
    endNode: EndNode,
    forkNode: ForkNode,
    completionNode: CompletionNode,
    processNode: ProcessNode,
    externalNode: ExternalNode,
    contactNode: ContactNode,
  }), []);

  // 1. Estado para controlar se está arrastando
  const [isConnecting, setIsConnecting] = useState(false);

  // 2. Eventos de início e fim de conexão
  const onConnectStart: OnConnectStart = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(() => {
    setIsConnecting(false);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid={true}
        snapGrid={[16, 16]}
        style={{ backgroundColor: 'var(--bg-canvas)' }}
        className={isConnecting ? 'app-connecting' : ''}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
      >
        <Background 
          color={gridColor} 
          gap={16} 
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