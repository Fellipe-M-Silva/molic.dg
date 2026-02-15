import { type Edge } from "reactflow";

export interface ReconnectionContextType {
	isReconnecting: boolean;
	reconnectingEdge: Edge | null;
	sourceNodeId: string | null;
	targetNodeId: string | null;
	setReconnecting: (edge: Edge) => void;
	resetReconnecting: () => void;
}
