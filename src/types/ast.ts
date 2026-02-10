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
	variant: "normal" | "alert";
	id: string;
	label?: string;
	content: ContentNode[];
	exits: ContentNode[];
}

export interface GlobalNode extends ASTNode {
	type: "global";
	id: string;
	content: ContentNode[];
}

// Conteúdos possíveis dentro de uma cena
export type ContentNode =
	| TopicNode
	| FlowControlNode
	| DialogNode
	| UtteranceNode
	| EventNode
	| ConditionNode
	| WhyNode
	| LetNode
	| ProcessNode
	| TerminalNode
	| ForkNode
	| ExternalNode
	| ContactNode;

export interface UtteranceNode extends ASTNode {
	type: "utterance";
	speaker: "user" | "system" | "mixed";
	text: string;
	condition?: string;
	transition?: TransitionNode;
}

export interface FlowControlNode extends ASTNode {
	type: "flow";
	variant: "seq" | "xor" | "or" | "and";
	condition?: string;
	children: ContentNode[];
}

export interface DialogNode extends ASTNode {	
	type: "dialog";
	children: ContentNode[];
}

export interface WhyNode extends ASTNode {
	type: "why";
	text: string;
}

export interface LetNode extends ASTNode {
	type: "let";
	variable: string;
	value: string;
}

export interface TransitionNode {
	targetId: string;
	kind: "normal" | "repair"; // -> ou ..>
}

export interface TopicNode {
	type: "topic";
	text: string;
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

export interface EventNode {
	type: "event";
	trigger: string;
	transition?: TransitionNode;
}

export interface ConditionNode {
	type: "condition";
	expression: string;
}

export interface ProcessNode {
	type: "process";
	action: string;
	transition?: TransitionNode;
}

export interface ForkNode {
  type: "fork";
  id: string;
  content: ContentNode[]; 
}
export interface TerminalNode {
	type: "terminal";
	kind: "start" | "end" | "break";
	id: string;
	targetId?: string;
}

export interface ProcessNode {
	type: "process";
	id: string; 
	action: string;
	transition?: TransitionNode;
}

export interface ExternalNode {
  type: "external";
  id: string;
}

export interface ContactNode {
	type: "contact";
	id: string; 
	name: string;
	flows: {
		targetId: string;
		label?: string;
	}[];
}
