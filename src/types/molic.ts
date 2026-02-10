export type NodeType = "scene" | "system" | "global" | "alert";

export interface MolicNode {
	id: string;
	label: string;
	type: NodeType;
	topic?: string;
	content?: string[]; 
}

export interface MolicEdge {
	id: string;
	source: string;
	target: string;
	label?: string;
	type: "user" | "system" | "repair" | "auto";
}

export interface ParsedDiagram {
	nodes: MolicNode[];
	edges: MolicEdge[];
	errors: string[];
}
