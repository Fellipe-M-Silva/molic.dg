/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ohm from "ohm-js";
import type {
	DiagramAST,
	UtteranceNode,
	FlowControlNode,
	StartNode,
	ContentNode,
} from "../types/ast";

export const grammarSource = `
Molic {
  Diagram = Element*

  Element = Scene | Global

  Scene = "scene" identifier "{" BlockContent* "}"
  Global = "global" identifier "{" BlockContent* "}"

  BlockContent = Topic | Dialog | FlowControl | Utterance | Event | Condition

  Topic = "topic:" string
  Dialog = "dialog" identifier "{" BlockContent* "}"
  
  FlowControl = FlowType "{" BlockContent* "}"
  FlowType = "seq" | "xor" | "or"

  Utterance = SystemUtterance | UserUtterance | MixedUtterance
  SystemUtterance = "d:" string Transition?
  UserUtterance = "u:" string Transition?
  MixedUtterance = "du:" FieldList

  Event = "when:" string Transition?
  Condition = "if:" string

  Transition = Arrow identifier
  Arrow = "->" | "..>"

  FieldList = NonemptyListOf<Field, ",">
  Field = identifier 

  identifier = letter (alnum | "_")*
  
  string = dqString | sqString
  dqString = "\\"" strChar* "\\""
  sqString = "'" sqChar* "'"
  
  strChar = ~"\\"" any
  sqChar = ~"'" any
}
`;

const grammar = ohm.grammar(grammarSource);
const semantics = grammar.createSemantics();

semantics.addOperation("toAST", {
	Diagram(elements: any) {
		return {
			elements: elements.children
				.map((c: any) => c.toAST())
				.filter((c: any) => c !== null),
		};
	},

	Scene(_scene: any, id: any, _open: any, contents: any, _close: any) {
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		return {
			type: "scene",
			id: id.sourceString,
			content: contentNodes,
		};
	},

	Global(_global: any, id: any, _open: any, contents: any, _close: any) {
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		return {
			type: "global",
			id: id.sourceString,
			content: contentNodes,
		};
	},

	Topic(_colon: any, text: any) {
		return { type: "topic", text: text.toAST() };
	},

	Dialog(_dialog: any, id: any, _open: any, contents: any, _close: any) {
		return {
			type: "dialog",
			id: id.sourceString,
			content: contents.children.map((c: any) => c.toAST()),
		};
	},

	FlowControl(flowType: any, _open: any, contents: any, _close: any) {
		return {
			type: "flow",
			variant: flowType.toAST(),
			children: contents.children.map((c: any) => c.toAST()),
		};
	},

	FlowType(_type: any) {
		return this.sourceString;
	},

	SystemUtterance(_d: any, text: any, transition: any) {
		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		};
	},

	UserUtterance(_u: any, text: any, transition: any) {
		return {
			type: "utterance",
			speaker: "user",
			text: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		};
	},

	MixedUtterance(_du: any, fields: any) {
		return {
			type: "utterance",
			speaker: "mixed",
			fields: fields.toAST(),
		};
	},

	Event(_when: any, text: any, transition: any) {
		return {
			type: "event",
			trigger: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		};
	},

	Condition(_if: any, text: any) {
		return {
			type: "condition",
			condition: text.toAST(),
		};
	},

	Transition(arrow: any, id: any) {
		return {
			arrow: arrow.sourceString,
			targetId: id.sourceString,
		};
	},

	Arrow(_arrow: any) {
		return this.sourceString;
	},

	FieldList(list: any) {
		return list.toAST();
	},

	Field(id: any) {
		return {
			name: id.sourceString,
		};
	},

	dqString(_open: any, chars: any, _close: any) {
		return chars.sourceString;
	},

	sqString(_open: any, chars: any, _close: any) {
		return chars.sourceString;
	},

	identifier(_first: any, _rest: any) {
		return this.sourceString;
	},

	_nonterminal(...children: any[]) {
		return children.length === 1
			? children[0].toAST()
			: children.map((c) => c.toAST());
	},

	_terminal() {
		return this.sourceString;
	},
});

const markDefaultFlows = (ast: DiagramAST) => {
	// Simplificado - sem operações para a nova gramática
};

export const parseMolic = (input: string) => {
	try {
		const match = grammar.match(input);
		if (match.failed()) return { ast: null, error: match.message };
		const ast = semantics(match).toAST() as DiagramAST;
		return { ast, error: null };
	} catch (e: any) {
		return { ast: null, error: e.message };
	}
};
