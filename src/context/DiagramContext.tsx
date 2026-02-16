import React from 'react';
import type { ReactNode } from 'react';
import type { Node, Edge } from 'reactflow';
import { DiagramContext } from './DiagramContextValue';

interface DiagramProviderProps {
	children: ReactNode;
	nodes: Node[];
	edges: Edge[];
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({
	children,
	nodes,
	edges,
}) => {
	return (
		<DiagramContext.Provider value={{ nodes, edges }}>
			{children}
		</DiagramContext.Provider>
	);
};

