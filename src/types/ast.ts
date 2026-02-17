export interface ASTNode {
	type: string;
}

export interface DiagramAST {
	elements: ElementNode[];
}

export type ElementNode =
	| SceneNode
	| GlobalNode
	| TerminalNode
	| ForkNode
	| ProcessNode
	| ExternalNode
	| ContactNode;

export type ContentNode =
	| TopicNode
	| SubtopicNode
	| LetNode
	| EffectNode
	| WhyNode
	| DialogNode
	| FlowControlNode
	| UtteranceNode
	| EventNode;

// --- ESTRUTURAS PRINCIPAIS ---

export interface SceneNode extends ASTNode {
	type: "scene";
	variant: "normal" | "alert";
	label?: string;
	isMain: boolean;
	id: string;
	content: ContentNode[]; // Conteúdo interno (Topic, Dialogs, Utterances sem saída)
	exits: ContentNode[]; // Utterances/Events que causam transição de cena
}

export interface GlobalNode extends ASTNode {
	type: "global";
	id: string;
	content: ContentNode[];
	exits: ContentNode[]; // Transições globais
}

export interface ProcessNode extends ASTNode {
	type: "process";
	id: string;
	content: ContentNode[]; // Agora suporta múltiplas saídas/falas
}

export interface ForkNode extends ASTNode {
	type: "fork";
	id: string;
	content: (
		| UtteranceNode
		| { type: "utterance"; text: ""; transition: TransitionNode }
	)[];
}

export interface StartNode extends ASTNode {
	type: "terminal";
	kind: "start";
	id: string;
	content: UtteranceNode[]; // Start agora tem conteúdo (falas)
}

export interface TerminalNode extends ASTNode {
	type: "terminal";
	kind: "start" | "end" | "break";
	id: string;
	targetId?: string; // Apenas para 'start'
}

export interface ExternalNode extends ASTNode {
	type: "external";
	id: string;
}

export interface ContactNode extends ASTNode {
	type: "contact";
	id: string;
	role: string;
	content: UtteranceNode[];
	flows: { targetId: string; label?: ContentNode }[];
}

// --- CONTEÚDO ---

export interface TopicNode extends ASTNode {
	type: "topic";
	text: string;
}

export interface SubtopicNode extends ASTNode {
	type: "subtopic";
	text: string;
}

export interface LetNode extends ASTNode {
	type: "let";
	value: string;
}

export interface EffectNode extends ASTNode {
	type: "effect";
	value: string;
}

export interface WhyNode extends ASTNode {
	type: "why";
	value: string;
}

export interface DialogNode extends ASTNode {
	type: "dialog";
	children: ContentNode[];
}

export interface FlowControlNode extends ASTNode {
	type: "flow";
	variant: "seq" | "xor" | "or" | "and";
	condition?: string;
	isDefaultLayer?: boolean;
	children: ContentNode[];
}

export interface EventNode extends ASTNode {
	type: "event";
	trigger: string;
	transition?: TransitionNode;
}

// --- UTTERANCES & TRANSITIONS ---

export interface UtteranceNode extends ASTNode {
	type: "utterance";
	speaker: "system" | "user" | "mixed" | "anonymous";
	text: string;
	condition?: string;
	when?: string;
	let?: string; // Inline let
	effect?: string; // Inline effect
	why?: string; // Inline why
	transition?: TransitionNode;
}

export interface TransitionNode {
	targetId: string;
	kind: "normal" | "repair" | "simultaneous" | "mediated";
	isPreferred: boolean;
}
