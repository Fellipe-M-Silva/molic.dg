import React, { createContext } from "react";
import type { Node, Edge } from "reactflow";

export interface DiagramContextType {
	nodes: Node[];
	edges: Edge[];
}

export const DiagramContext = createContext<DiagramContextType | undefined>(
	undefined,
);

export const useDiagramContext = () => {
	const context = React.useContext(DiagramContext);
	if (!context) {
		throw new Error(
			"useDiagramContext deve ser usado dentro de um DiagramProvider",
		);
	}
	return context;
};
