/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ohm from "ohm-js";
import type { DiagramAST } from "../types/ast";

export const grammarSource = `
Molic {
  Diagram = Element*

  Element = Scene | Global | Start | Terminal | External

  Scene = "main"? "scene" identifier "{" SceneContent* "}"
  Global = "global" identifier "{" SceneContent* "}"
  Start = "start" identifier "{" SceneContent* "}"
  Terminal = ("end" | "break") identifier
  External = "external" identifier

  SceneContent = Topic | SubTopic | FlowControl | UtteranceWithTransition

  Topic = "topic:" string
  SubTopic = "subtopic:" string
  
  FlowControl = FlowType Condition? "{" FlowContent* "}"
  FlowType = "and" | "seq" | "or" | "xor"
  
  FlowContent = SubTopic | UtteranceWithTransition

  UtteranceWithTransition = Utterance Transition?

  Utterance = SystemUtterance | UserUtterance | MixedUtterance | AnonymousUtterance

  SystemUtterance = "d:" string Trigger? LetClause? EffectClause?
  UserUtterance = "u:" string Trigger? LetClause? EffectClause?
  MixedUtterance = "du:" string Trigger? LetClause? EffectClause?
  AnonymousUtterance = dqString Trigger? LetClause? EffectClause?

  Trigger = Condition | When
  Condition = "if" string
  When = "when" string
  
  LetClause = "let" string
  EffectClause = "effect" string

  Transition = Arrow identifier
  Arrow = "->" | "..>"

  string = dqString | sqString
  dqString = "\\"" (~"\\"" any)* "\\""
  sqString = "'" (~"'" any)* "'"

  identifier = letter (alnum | "_")*
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

	Scene(
		mainOpt: any,
		_scene: any,
		id: any,
		_open: any,
		contents: any,
		_close: any,
	) {
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);

		const topicNode = contentNodes.find((c: any) => c.type === "topic");
		const label = topicNode?.text;
		const exits = contentNodes.filter(
			(c: any) => c.type === "utterance" && c.transition,
		);

		return {
			type: "scene",
			id: id.sourceString,
			label: label,
			content: contentNodes,
			exits: exits,
			isMain: mainOpt.numChildren > 0,
			variant: "normal",
		};
	},

	Global(_global: any, id: any, _open: any, connections: any, _close: any) {
		const connNodes = connections.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		return {
			type: "global",
			id: id.sourceString,
			content: connNodes,
			exits: connNodes,
		};
	},

	Start(_start: any, id: any, _open: any, connections: any, _close: any) {
		const connNodes = connections.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		return {
			type: "terminal",
			kind: "start",
			id: id.sourceString,
			content: connNodes,
		};
	},

	Terminal(keyword: any, id: any) {
		const kind = keyword.sourceString === "end" ? "end" : "break";
		return {
			type: "terminal",
			kind: kind,
			id: id.sourceString,
		};
	},

	External(_external: any, id: any) {
		return {
			type: "external",
			id: id.sourceString,
		};
	},

	Topic(_colon: any, text: any) {
		return { type: "topic", text: text.toAST() };
	},

	SubTopic(_colon: any, text: any) {
		return { type: "subtopic", text: text.toAST() };
	},

	FlowControl(
		flowType: any,
		condition: any,
		_open: any,
		contents: any,
		_close: any,
	) {
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		const cond =
			condition.numChildren > 0
				? condition.children[0].toAST()
				: undefined;

		return {
			type: "flow",
			variant: flowType.sourceString,
			condition: cond?.condition,
			children: contentNodes,
		};
	},

	SystemUtterance(
		_d: any,
		text: any,
		trigger: any,
		letClause: any,
		effectClause: any,
	) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;
		const letVal =
			letClause.numChildren > 0
				? letClause.children[0].toAST()
				: undefined;
		const eff =
			effectClause.numChildren > 0
				? effectClause.children[0].toAST()
				: undefined;

		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
			let: letVal?.value,
			effect: eff?.value,
		};
	},

	UserUtterance(
		_u: any,
		text: any,
		trigger: any,
		letClause: any,
		effectClause: any,
	) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;
		const letVal =
			letClause.numChildren > 0
				? letClause.children[0].toAST()
				: undefined;
		const eff =
			effectClause.numChildren > 0
				? effectClause.children[0].toAST()
				: undefined;

		return {
			type: "utterance",
			speaker: "user",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
			let: letVal?.value,
			effect: eff?.value,
		};
	},

	MixedUtterance(
		_du: any,
		text: any,
		trigger: any,
		letClause: any,
		effectClause: any,
	) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;
		const letVal =
			letClause.numChildren > 0
				? letClause.children[0].toAST()
				: undefined;
		const eff =
			effectClause.numChildren > 0
				? effectClause.children[0].toAST()
				: undefined;

		return {
			type: "utterance",
			speaker: "mixed",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
			let: letVal?.value,
			effect: eff?.value,
		};
	},

	AnonymousUtterance(
		text: any,
		trigger: any,
		letClause: any,
		effectClause: any,
	) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;
		const letVal =
			letClause.numChildren > 0
				? letClause.children[0].toAST()
				: undefined;
		const eff =
			effectClause.numChildren > 0
				? effectClause.children[0].toAST()
				: undefined;

		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
			let: letVal?.value,
			effect: eff?.value,
		};
	},

	UtteranceWithTransition(utterance: any, transition: any) {
		const utt = utterance.toAST();
		const trans =
			transition.numChildren > 0
				? transition.children[0].toAST()
				: undefined;
		return {
			...utt,
			transition: trans,
		};
	},

	Condition(_if: any, text: any) {
		return { condition: text.toAST() };
	},

	When(_when: any, text: any) {
		return { when: text.toAST() };
	},

	LetClause(_let: any, text: any) {
		return { type: "let", value: text.toAST() };
	},

	EffectClause(_effect: any, text: any) {
		return { type: "effect", value: text.toAST() };
	},

	Transition(arrow: any, id: any) {
		const kind = arrow.sourceString === "..>" ? "repair" : "normal";
		return {
			kind: kind,
			targetId: id.sourceString,
			isPreferred: false,
		};
	},

	dqString(_open: any, chars: any, _close: any) {
		return chars.sourceString;
	},

	sqString(_open: any, chars: any, _close: any) {
		return chars.sourceString;
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
