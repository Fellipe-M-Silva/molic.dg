/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ohm from "ohm-js";
import { grammarSource } from "./grammar";

import type {
	DiagramAST,
	SceneNode,
	GlobalNode,
	UtteranceNode,
	FlowControlNode,
	TransitionNode,
} from "../types/ast";

const grammar = ohm.grammar(grammarSource);
const semantics = grammar.createSemantics();

semantics.addOperation("toAST", {
	Diagram(elements: any) {
		return {
			elements: elements.children
				.map((c: any) => c.toAST())
				.filter((c: any) => c !== null),
		} as DiagramAST;
	},

	Scene(_scene: any, id: any, _open: any, contents: any, _close: any) {
		return {
			type: "scene",
			id: id.sourceString,
			content: contents.children.map((c: any) => c.toAST()),
		} as SceneNode;
	},

	Global(_global: any, id: any, _open: any, contents: any, _close: any) {
		return {
			type: "global",
			id: id.sourceString,
			content: contents.children.map((c: any) => c.toAST()),
		} as GlobalNode;
	},

	Topic(_label: any, text: any) {
		return { type: "topic", text: text.toAST() };
	},

	FlowControl(type: any, _open: any, contents: any, _close: any) {
		return {
			type: "flow",
			variant: type.sourceString as "seq" | "xor" | "or",
			children: contents.children.map((c: any) => c.toAST()),
		} as FlowControlNode;
	},

	Dialog(_tag: any, id: any, _open: any, contents: any, _close: any) {
		return {
			type: "flow",
			variant: "dialog",
			id: id.sourceString,
			children: contents.children.map((c: any) => c.toAST()),
		} as FlowControlNode;
	},

	SystemUtterance(_tag: any, text: any, transition: any) {
		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		} as UtteranceNode;
	},

	UserUtterance(_tag: any, text: any, transition: any) {
		return {
			type: "utterance",
			speaker: "user",
			text: text.toAST(),
			transition:
				transition.numChildren > 0
					? transition.children[0].toAST()
					: undefined,
		} as UtteranceNode;
	},

	MixedUtterance(_tag: any, fieldList: any) {
		return {
			type: "utterance",
			speaker: "mixed",
			text: fieldList.sourceString,
		} as UtteranceNode;
	},

	Transition(arrow: any, targetId: any) {
		return {
			targetId: targetId.sourceString,
			kind: arrow.sourceString === "..>" ? "repair" : "normal",
		} as TransitionNode;
	},

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
