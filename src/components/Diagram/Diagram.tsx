import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionMode,
  useNodesState,
  useEdgesState,
  type OnConnectStart,
  type OnConnectEnd,
  type Edge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { MolicNode } from './MolicNode';
import { SimultaneousEdge } from './SimultaneousEdge';
import { MolicEdge } from './MolicEdge';
import { transformer } from '../../core/transformer';
import { parseMolic } from '../../core/parser';
import { useLayoutPersistence } from '../../hooks/useLayoutPersistence';

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
  const { saveLayout, applySavedLayout } = useLayoutPersistence();
  const edgeReconnectSuccessful = useRef(true);

  const onConnectStart: OnConnectStart = useCallback(() => setIsConnecting(true), []);
  const onConnectEnd: OnConnectEnd = useCallback(() => setIsConnecting(false), []);
  
  // Handler para reconexão de edges
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      // Verificar se está tentando mudar o source ou target node
      // Apenas permitir troca de handles dentro do mesmo nó
      const sourceChanged = oldEdge.source !== newConnection.source;
      const targetChanged = oldEdge.target !== newConnection.target;
      
      if (sourceChanged || targetChanged) {
        console.warn('[MoLIC] Não é possível mudar a conexão entre nós. Apenas handles podem ser alterados.');
        return;
      }
      
      console.log('[MoLIC] Reconectando edge:', {
        id: oldEdge.id,
        antes: { source: oldEdge.sourceHandle, target: oldEdge.targetHandle },
        depois: { source: newConnection.sourceHandle, target: newConnection.targetHandle }
      });
      
      edgeReconnectSuccessful.current = true;
      setEdges((els) => {
        // Atualizar apenas os handles do edge existente, mantendo o ID original
        const updated = els.map(e => 
          e.id === oldEdge.id 
            ? { 
                ...e, 
                sourceHandle: newConnection.sourceHandle || e.sourceHandle,
                targetHandle: newConnection.targetHandle || e.targetHandle,
                source: newConnection.source || e.source,
                target: newConnection.target || e.target
              }
            : e
        );
        console.log('[MoLIC] Edges após reconexão:');
        updated.forEach(e => console.log(`  ${e.id}: source=${e.sourceHandle}, target=${e.targetHandle}`));
        // Forçar salvamento imediato após reconexão
        setTimeout(() => saveLayout(nodes, updated), 100);
        return updated;
      });
    },
    [setEdges, nodes, saveLayout]
  );
  
  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges]
  );
  
  // Salvar layout quando nodes ou edges mudam
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      saveLayout(nodes, edges);
    }
  }, [nodes, edges, saveLayout]);

  useEffect(() => {
    if (!code) return;
    const { ast, error } = parseMolic(code);
    
    if (error) {
      console.warn("Syntax Error:", error);
      return; 
    }

    if (ast) {
      // Carregar handles salvos
      const savedString = localStorage.getItem('molic-layout-stable-v4');
      let savedHandlesMap: Map<string, { sourceHandle: string, targetHandle: string }> | undefined;
      
      console.log('[MoLIC] ===== RECONSTRUINDO DIAGRAMA =====');
      
      if (savedString) {
        try {
          const saved = JSON.parse(savedString);
          console.log('[MoLIC] Handles salvos no localStorage:');
          saved.edges.forEach((e: any) => {
            console.log(`  ${e.id}: source=${e.sourceHandle}, target=${e.targetHandle}`);
          });
          
          savedHandlesMap = new Map(
            saved.edges
              .filter((e: any) => e.sourceHandle && e.targetHandle)
              .map((e: any) => [
                e.id,
                { sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }
              ])
          );
          console.log('[MoLIC] Handles mapeados para transformer:', savedHandlesMap.size);
        } catch (e) {
          console.error('Erro ao carregar handles salvos', e);
        }
      }
      
      const { nodes: layoutNodes, edges: layoutEdges } = transformer(ast, savedHandlesMap);
      console.log('[MoLIC] Edges gerados pelo transformer:');
      layoutEdges.forEach(e => console.log(`  ${e.id}: source=${e.sourceHandle}, target=${e.targetHandle}`));
      
      // Aplicar layout salvo (positions)
      const { nodes: finalNodes, edges: finalEdges } = applySavedLayout(layoutNodes, layoutEdges);
      setNodes(finalNodes);
      setEdges(finalEdges);
    }
  }, [code, setNodes, setEdges, applySavedLayout]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        reconnectRadius={20}
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