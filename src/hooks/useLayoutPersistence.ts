import { useCallback } from "react";
import type { Node, Edge, XYPosition } from "reactflow";

const STORAGE_KEY = "molic-layout-stable-v4";

interface SavedNode {
	id: string;
	position: XYPosition;
}

interface SavedEdge {
	id: string;
	sourceHandle?: string | null;
	targetHandle?: string | null;
}

interface SavedLayout {
	nodes: SavedNode[];
	edges: SavedEdge[];
}

export const useLayoutPersistence = () => {
	const saveLayout = useCallback((nodes: Node[], edges: Edge[]) => {
		if (nodes.length === 0 && edges.length === 0) return;

		const layout: SavedLayout = {
			nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
			edges: edges.map((e) => ({
				id: e.id,
				sourceHandle: e.sourceHandle || null,
				targetHandle: e.targetHandle || null,
			})),
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
	}, []);

	const applySavedLayout = useCallback((nodes: Node[], edges: Edge[]) => {
		const savedString = localStorage.getItem(STORAGE_KEY);
		if (!savedString) return { nodes, edges };

		try {
			const saved = JSON.parse(savedString) as SavedLayout;
			const savedNodesMap = new Map(saved.nodes.map((n) => [n.id, n]));

			// Apenas aplicar posições dos nós (handles já foram aplicados no transformer)
			const mergedNodes = nodes.map((node) => {
				const savedNode = savedNodesMap.get(node.id);
				return savedNode
					? { ...node, position: savedNode.position }
					: node;
			});

			return { nodes: mergedNodes, edges };
		} catch (e) {
			console.error("Erro ao carregar layout salvo", e);
			return { nodes, edges };
		}
	}, []);

	return { saveLayout, applySavedLayout };
};
