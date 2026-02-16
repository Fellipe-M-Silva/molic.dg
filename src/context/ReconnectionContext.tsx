import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import { type Edge } from 'reactflow';
import { type ReconnectionContextType } from './ReconnectionContextType';

export { type ReconnectionContextType } from './ReconnectionContextType';

export const ReconnectionContext = createContext<ReconnectionContextType | undefined>(undefined);

interface ReconnectionProviderProps {
  children: ReactNode;
}

export const ReconnectionProvider: React.FC<ReconnectionProviderProps> = ({ children }) => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectingEdge, setReconnectingEdge] = useState<Edge | null>(null);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  const handleSetReconnecting = useCallback((edge: Edge) => {
    setReconnectingEdge(edge);
    setSourceNodeId(edge.source);
    setTargetNodeId(edge.target);
    setIsReconnecting(true);
  }, []);

  const handleResetReconnecting = useCallback(() => {
    setIsReconnecting(false);
    setReconnectingEdge(null);
    setSourceNodeId(null);
    setTargetNodeId(null);
  }, []);

  const value: ReconnectionContextType = {
    isReconnecting,
    reconnectingEdge,
    sourceNodeId,
    targetNodeId,
    setReconnecting: handleSetReconnecting,
    resetReconnecting: handleResetReconnecting,
  };

  return (
    <ReconnectionContext.Provider value={value}>
      {children}
    </ReconnectionContext.Provider>
  );
};
