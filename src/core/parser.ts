/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ohm from "ohm-js";

import type {
	DiagramAST,
	SceneNode,
	GlobalNode,
	TerminalNode,
	ForkNode,
	UtteranceNode,
	FlowControlNode,
	TransitionNode,
	EventNode,
	ProcessNode,
	ExternalNode,
	ContactNode,
	LetNode,
	WhyNode,
	DialogNode,
} from "../types/ast";

// --- Definição da Gramática ---
export const grammarSource = `
Molic {
  Diagram = Element*

  Element
    = AlertScene | Scene | Global | Terminal | Fork | SystemProcess | External | Contact

  // --- Estruturas de Bloco ---
  Scene      = "main"? "scene" identifier "{" BlockContent* "}"
  AlertScene = "scene" "alert" identifier "{" BlockContent* "}"
  Global     = "global" identifier "{" BlockContent* "}"
  
  // Fork, External, Contact, Process
  Fork = "fork" identifier "{" ForkContent* "}"
  ForkContent 
    = Utterance
    | Redirect
  Redirect = "->" identifier
  External = "external" identifier
  Contact  = "contact" identifier "{" ContactBody* "}"
  ContactBody = ContactRole | ContactFlow
  ContactRole = "role:" string
  ContactFlow = "role" Transition string?
  SystemProcess = "process" identifier string Transition?
  
  // CORREÇÃO 1: Labels recolocados obrigatóriamente
  Terminal 
    = "start" identifier "->" identifier  -- start
    | "end" identifier                    -- end
    | "break" identifier                  -- completion

  // --- Conteúdo Rico da Cena ---
  BlockContent
    = Topic
    | Let
    | Why
    | Dialog
    | FlowControl
    | Utterance
    | Event

  Topic = "topic:" string
  
  // Variáveis: let var = value
  Let = "let" identifier "=" (string | identifier)

  // Racional: why: "motivo"
  Why = "why:" string

  // Agrupamento de Diálogo
  Dialog = "dialog" "{" BlockContent* "}"

  // Fluxos: (seq|or|xor|and) [if "cond"] { ... }
  FlowControl = ("seq" | "xor" | "or" | "and") Condition? "{" BlockContent* "}"

  // Falas
  Utterance = SystemUtterance | UserUtterance | MixedUtterance
  
  SystemUtterance = "d:" string Condition? Transition?
  UserUtterance   = "u:" string Condition? Transition?
  MixedUtterance  = "du:" string Condition?

  Event     = "when:" string Transition?
  
  // Sintaxe do IF: if "texto"
  Condition = "if" string

  Transition = Arrow identifier
  Arrow = "->" | "..>"

  // --- Primitivos ---
  identifier = letter (alnum | "_")*
  
  // CORREÇÃO 2: Labels adicionados para casar com a semântica (string_doubleQuote)
  string     
    = "\\"" (~"\\"" any)* "\\""   -- doubleQuote
    | "'" (~"'" any)* "'"       -- singleQuote

  comment = "//" (~"\\n" any)* ("\\n" | end) | "/*" (~"*/" any)* "*/"
  space  += comment
}
`;

const grammar = ohm.grammar(grammarSource);
const semantics = grammar.createSemantics();

// --- Mapeamento Semântico (AST) ---
semantics.addOperation("toAST", {
	Diagram(elements: any) {
		return {
			elements: elements.children
				.map((c: any) => c.toAST())
				.filter((c: any) => c !== null),
		} as DiagramAST;
	},

	// Estruturas Principais
	Scene(
		mainOpt: any,
		_scene: any,
		id: any,
		_open: any,
		contents: any,
		_close: any,
	) {
		const allItems = contents.children.map((c: any) => c.toAST());

		// SEPARAÇÃO:
		// 1. Exits: Utterances (u:, d:) que têm transição (->) E estão na raiz da cena
		// 2. Content: Todo o resto (Dialogs, Topics, Lets, Whys, ou Utterances sem link)

		const exits = allItems.filter(
			(item: any) =>
				(item.type === "utterance" || item.type === "event") &&
				item.transition,
		);

		const content = allItems.filter(
			(item: any) =>
				!(
					(item.type === "utterance" || item.type === "event") &&
					item.transition
				),
		);

		return {
			type: "scene",
			variant: "normal",
			isMain: mainOpt.numChildren > 0,
			id: id.sourceString,
			content: content,
			exits: exits,
		} as SceneNode;
	},

	AlertScene(
		_scene: any,
		_alert: any,
		id: any,
		_open: any,
		contents: any,
		_close: any,
	) {
		const allItems = contents.children.map((c: any) => c.toAST());

		const exits = allItems.filter(
			(item: any) =>
				(item.type === "utterance" || item.type === "event") &&
				item.transition,
		);

		const content = allItems.filter(
			(item: any) =>
				!(
					(item.type === "utterance" || item.type === "event") &&
					item.transition
				),
		);

		return {
			type: "scene",
			variant: "alert",
			id: id.sourceString,
			content: content,
			exits: exits,
		} as SceneNode;
	},

	Global(_global: any, id: any, _open: any, contents: any, _close: any) {
		return {
			type: "global",
			id: id.sourceString,
			content: contents.children.map((c: any) => c.toAST()),
		} as GlobalNode;
	},

	// Terminais (Agora vai funcionar porque os labels -- start existem na gramática)
	Terminal_start(_tag: any, id: any, _arrow: any, target: any) {
		return {
			type: "terminal",
			kind: "start",
			id: id.sourceString,
			targetId: target.sourceString,
		} as TerminalNode;
	},

	Terminal_end(_tag: any, id: any) {
		return {
			type: "terminal",
			kind: "end",
			id: id.sourceString,
		} as TerminalNode;
	},

	Terminal_completion(_tag: any, id: any) {
		return {
			type: "terminal",
			kind: "break",
			id: id.sourceString,
		} as TerminalNode;
	},

	External(_tag: any, id: any) {
		return {
			type: "external",
			id: id.sourceString,
		} as ExternalNode;
	},

	Contact(_tag: any, id: any, _open: any, body: any, _close: any) {
		const content = body.children.map((c: any) => c.toAST());

		const roleNode = content.find((c: any) => c.type === "contact-role");
		const name = roleNode ? roleNode.value : id.sourceString;

		const flows = content
			.filter((c: any) => c.type === "contact-flow")
			.map((c: any) => ({ targetId: c.targetId, label: c.label }));

		return {
			type: "contact",
			id: id.sourceString,
			name: name,
			flows: flows,
		} as ContactNode;
	},

	ContactRole(_tag: any, text: any) {
		return { type: "contact-role", value: text.toAST() };
	},

	ContactFlow(_tag: any, transition: any, optLabel: any) {
		const trans = transition.toAST();
		const label =
			optLabel.numChildren > 0 ? optLabel.children[0].toAST() : undefined;

		return {
			type: "contact-flow",
			targetId: trans.targetId,
			label: label,
		};
	},

	Fork(_tag: any, id: any, _open: any, body: any, _close: any) {
		return {
			type: "fork",
			id: id.sourceString,
			content: body.children.map((c: any) => c.toAST()),
		} as ForkNode;
	},

	Redirect(_arrow: any, id: any) {
		return {
			type: "utterance",
			text: "",
			transition: { kind: "normal", targetId: id.sourceString },
		};
	},

	SystemProcess(_tag: any, id: any, text: any, transition: any) {
		return {
			type: "process",
			id: id.sourceString,
			action: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		} as ProcessNode;
	},

	// Componentes Internos
	Topic(_label: any, text: any) {
		return { type: "topic", text: text.toAST() };
	},

	Let(_tag: any, id: any, _eq: any, val: any) {
		return {
			type: "let",
			variable: id.sourceString,
			value: val.sourceString.replace(/['"]/g, ""),
		} as LetNode;
	},

	Why(_tag: any, text: any) {
		return { type: "why", text: text.toAST() } as WhyNode;
	},

	Dialog(_tag: any, _open: any, contents: any, _close: any) {
		return {
			type: "dialog",
			children: contents.children.map((c: any) => c.toAST()),
		} as DialogNode;
	},

	FlowControl(type: any, cond: any, _open: any, contents: any, _close: any) {
		const condition =
			cond.numChildren > 0 ? cond.children[0].toAST() : undefined;
		return {
			type: "flow",
			variant: type.sourceString as any,
			condition: condition,
			children: contents.children.map((c: any) => c.toAST()),
		} as FlowControlNode;
	},

	SystemUtterance(_tag: any, text: any, cond: any, trans: any) {
		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			condition:
				cond.numChildren > 0 ? cond.children[0].toAST() : undefined,
			transition:
				trans.numChildren > 0 ? trans.children[0].toAST() : undefined,
		} as UtteranceNode;
	},
	UserUtterance(_tag: any, text: any, cond: any, trans: any) {
		return {
			type: "utterance",
			speaker: "user",
			text: text.toAST(),
			condition:
				cond.numChildren > 0 ? cond.children[0].toAST() : undefined,
			transition:
				trans.numChildren > 0 ? trans.children[0].toAST() : undefined,
		} as UtteranceNode;
	},
	MixedUtterance(_tag: any, text: any, cond: any) {
		return {
			type: "utterance",
			speaker: "mixed",
			text: text.toAST(),
			condition:
				cond.numChildren > 0 ? cond.children[0].toAST() : undefined,
		} as UtteranceNode;
	},

	Condition(_if: any, text: any) {
		return text.toAST();
	},

	Event(_tag: any, text: any, transition: any) {
		return {
			type: "event",
			trigger: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		} as EventNode;
	},

	// Utilitários e Primitivos
	Transition(arrow: any, targetId: any) {
		return {
			targetId: targetId.sourceString,
			kind: arrow.sourceString === "..>" ? "repair" : "normal",
		} as TransitionNode;
	},

	// Essas funções agora funcionam porque adicionamos -- doubleQuote e -- singleQuote na gramática
	string_doubleQuote(_open: any, chars: any, _close: any) {
		return chars.sourceString;
	},

	string_singleQuote(_open: any, chars: any, _close: any) {
		return chars.sourceString;
	},

	_iter(...children: any[]) {
		return children.map((c) => c.toAST());
	},

	_terminal(this: any) {
		return this.sourceString;
	},
});

export const parseMolic = (input: string) => {
	const match = grammar.match(input);

	if (match.failed()) {
		return {
			ast: null,
			error: match.message,
		};
	}

	const ast = semantics(match).toAST() as DiagramAST;
	return { ast, error: null };
};
