import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionMode,
  useNodesState,
  useEdgesState,
  type OnConnectStart,
  type OnConnectEnd,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { MolicNode } from './MolicNode';
import { SimultaneousEdge } from './SimultaneousEdge';
import { MolicEdge } from './MolicEdge';
import { transformer } from '../../core/transformer';
import { parseMolic } from '../../core/parser';

import './MolicEdge.css';
import './MolicNode.css'; 
import './Diagram.css';

interface DiagramProps {
  code: string;
}

export const Diagram: React.FC<DiagramProps> = ({ code }) => {
  const nodeTypes = useMemo(() => ({ molicNode: MolicNode }), []);
  const edgeTypes = useMemo(
    () => ({ simultaneous: SimultaneousEdge, molic: MolicEdge }),
    [],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const onConnectStart: OnConnectStart = useCallback(() => setIsConnecting(true), []);
  const onConnectEnd: OnConnectEnd = useCallback(() => setIsConnecting(false), []);

  useEffect(() => {
    if (!code) return;
    const { ast, error } = parseMolic(code);
    
    if (error) {
      console.warn("Syntax Error:", error);
      return; 
    }

    if (ast) {
      const { nodes: layoutNodes, edges: layoutEdges } = transformer(ast);
      setNodes(layoutNodes);
      setEdges(layoutEdges);
    }
  }, [code, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        snapToGrid={true}
        snapGrid={[16, 16]}
        className={isConnecting ? 'app-connecting' : ''}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        style={{ backgroundColor: 'var(--bg-canvas, #f5f5f5)' }}
      >
        <Background gap={16} size={1} />
        <Controls />
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <marker id="double-arrowhead" viewBox="0 0 20 10" refX="18" refY="5" markerWidth="10" markerHeight="10" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-base, #000)" />
              <path d="M 8 0 L 18 5 L 8 10 z" fill="var(--text-base, #000)" />
            </marker>
          </defs>
        </svg>
      </ReactFlow>
    </div>
  );
};