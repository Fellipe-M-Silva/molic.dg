// Tipos para nossa Árvore de Sintaxe Abstrata (AST)

export type ElementType = "scene" | "global";
export type BlockType = "seq" | "xor" | "or" | "dialog";

export interface ASTNode {
	type: string;
	source?: {
		start: number;
		end: number;
	};
}

export interface DiagramAST {
	elements: (SceneNode | GlobalNode)[];
}

export interface SceneNode extends ASTNode {
	type: "scene";
	id: string; 
	label?: string;
	content: ContentNode[];
}

export interface GlobalNode extends ASTNode {
	type: "global";
	id: string;
	content: ContentNode[];
}

// Conteúdos possíveis dentro de uma cena
export type ContentNode =
	| UtteranceNode
	| FlowControlNode
	| EventNode
	| ConditionNode;

export interface UtteranceNode extends ASTNode {
	type: "utterance";
	speaker: "user" | "system" | "mixed";
	text: string; // O texto da fala ou lista de campos
	isOptional?: boolean; // Para campos com '?'
	transition?: TransitionNode;
}

export interface FlowControlNode extends ASTNode {
	type: "flow";
	variant: "seq" | "xor" | "or" | "dialog";
	id?: string; // dialogs podem ter nome
	children: ContentNode[];
}

export interface TransitionNode {
	targetId: string;
	kind: "normal" | "repair"; // -> ou ..>
}

export interface EventNode extends ASTNode {
	type: "event";
	trigger: string;
	transition?: TransitionNode;
}

export interface ConditionNode extends ASTNode {
	type: "condition";
	expression: string;
}
