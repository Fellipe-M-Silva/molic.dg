/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ohm from "ohm-js";
import type { DiagramAST } from "../types/ast";

export const grammarSource = `
Molic {
  Diagram = Element*

	Element = Scene | Global | Start | Terminal | External | Contact | Process | Fork

  Scene = "main"? "alert"? "scene" identifier "{" SceneContent* "}"
  Global = "global" identifier "{" SceneContent* "}"
  Start = "start" identifier "{" SceneContent* "}"
  Terminal = ("end" | "break") identifier
  External = "external" identifier
	Contact = "contact" identifier "{" ContactContent* "}"
	Process = "process" identifier "{" UtteranceWithTransition* "}"
	Fork = "fork" identifier "{" UtteranceWithTransition* "}"

	SceneContent = Topic | FlowControl | UtteranceWithTransition | LetClause | EffectClause | WhyClause

  Topic = "topic:" string
  SubTopic = "subtopic:" string
  
  FlowControl = FlowType Condition? "{" FlowContent* "}"
  FlowType = "and" | "seq" | "or" | "xor"
  
	FlowContent = SubTopic | UtteranceWithTransition | FlowControl | LetClause | EffectClause | WhyClause

	ContactContent = RoleClause | ContactUtteranceWithTransition

	UtteranceWithTransition = Preferred Utterance InlineMeta+ Transition --preferredWithMeta
	                       | Preferred Utterance Transition --preferredPlain
	                       | Utterance InlineMeta+ Transition --withMeta
	                       | Utterance Transition? --plain

	ContactUtteranceWithTransition = Preferred ContactUtterance InlineMeta+ Transition --preferredWithMeta
	                             | Preferred ContactUtterance Transition --preferredPlain
	                             | ContactUtterance InlineMeta+ Transition --withMeta
	                             | ContactUtterance Transition? --plain

  Utterance = SystemUtterance | UserUtterance | MixedUtterance | AnonymousUtterance

	ContactUtterance = ":" string Trigger?

	SystemUtterance = "d:" string Trigger?
	UserUtterance = "u:" string Trigger?
	MixedUtterance = "du:" string Trigger?
	AnonymousUtterance = "anon:" Trigger?

  Trigger = Condition | When
  Condition = "if:" string
  When = "when:" string
  
	LetClause = "let:" string
	EffectClause = "effect:" string
	WhyClause = "why:" string
	RoleClause = "role:" string

	InlineMeta = LetClause | EffectClause | WhyClause

	Preferred = "preferred"

	Transition = Arrow identifier
  Arrow = "=>" | "->" | "..>"

  string = dqString | sqString
	dqString = "\\\"" (~"\\\"" any)* "\\\""
  sqString = "'" (~"'" any)* "'"
  
	comment
		= lineComment
		| percentComment
		| blockComment

	lineComment
		= "//" (~"\\n" any)*

	percentComment
		= "%" (~"\\n" any)*

	blockComment
		= "/*" (~"*/" any)* "*/"

	space += comment

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
		alertOpt: any,
		_scene: any,
		id: any,
		_open: any,
		contents: any,
		_close: any,
	) {
		void _close;
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
			variant: alertOpt.numChildren > 0 ? "alert" : "normal",
		};
	},

	Global(_global: any, id: any, _open: any, connections: any, _close: any) {
		void _close;
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
		void _close;
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

	Contact(_contact: any, id: any, _open: any, contents: any, _close: any) {
		void _close;
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		const roleNode = contentNodes.find((c: any) => c.type === "role");
		const role = roleNode?.value ?? id.sourceString;
		const utteranceNodes = contentNodes.filter(
			(c: any) => c.type !== "role",
		);
		return {
			type: "contact",
			id: id.sourceString,
			role: role,
			content: utteranceNodes,
			flows: [],
		};
	},

	Process(_process: any, id: any, _open: any, contents: any, _close: any) {
		void _close;
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		return {
			type: "process",
			id: id.sourceString,
			content: contentNodes,
		};
	},

	Fork(_fork: any, id: any, _open: any, contents: any, _close: any) {
		void _close;
		const contentNodes = contents.children
			.map((c: any) => c.toAST())
			.filter((c: any) => c !== null);
		return {
			type: "fork",
			id: id.sourceString,
			content: contentNodes,
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
		void _close;
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

	SystemUtterance(_d: any, text: any, trigger: any) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;

		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
		};
	},

	UserUtterance(_u: any, text: any, trigger: any) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;

		return {
			type: "utterance",
			speaker: "user",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
		};
	},

	MixedUtterance(_du: any, text: any, trigger: any) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;

		return {
			type: "utterance",
			speaker: "mixed",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
		};
	},

	AnonymousUtterance(_anon: any, trigger: any) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;

		return {
			type: "utterance",
			speaker: "anonymous",
			text: "",
			condition: trig?.condition,
			when: trig?.when,
		};
	},

	ContactUtterance(_colon: any, text: any, trigger: any) {
		const trig =
			trigger.numChildren > 0 ? trigger.children[0].toAST() : undefined;

		return {
			type: "utterance",
			speaker: "system",
			text: text.toAST(),
			condition: trig?.condition,
			when: trig?.when,
		};
	},

	UtteranceWithTransition_withMeta(
		utterance: any,
		metas: any,
		transition: any,
	) {
		const utt = utterance.toAST();
		const trans = transition.toAST();
		const metaNodes = metas.children.map((child: any) => child.toAST());
		const inline: { let?: string; effect?: string; why?: string } = {};
		metaNodes.forEach((meta: any) => {
			if (meta.type === "let") inline.let = meta.value;
			if (meta.type === "effect") inline.effect = meta.value;
			if (meta.type === "why") inline.why = meta.value;
		});
		return {
			...utt,
			...inline,
			transition: trans,
		};
	},

	UtteranceWithTransition_preferredWithMeta(
		_preferred: any,
		utterance: any,
		metas: any,
		transition: any,
	) {
		const utt = utterance.toAST();
		const trans = { ...transition.toAST(), isPreferred: true };
		const metaNodes = metas.children.map((child: any) => child.toAST());
		const inline: { let?: string; effect?: string; why?: string } = {};
		metaNodes.forEach((meta: any) => {
			if (meta.type === "let") inline.let = meta.value;
			if (meta.type === "effect") inline.effect = meta.value;
			if (meta.type === "why") inline.why = meta.value;
		});
		return {
			...utt,
			...inline,
			transition: trans,
		};
	},

	UtteranceWithTransition_plain(utterance: any, transition: any) {
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

	UtteranceWithTransition_preferredPlain(
		_preferred: any,
		utterance: any,
		transition: any,
	) {
		const utt = utterance.toAST();
		const trans = { ...transition.toAST(), isPreferred: true };
		return {
			...utt,
			transition: trans,
		};
	},

	ContactUtteranceWithTransition_withMeta(
		utterance: any,
		metas: any,
		transition: any,
	) {
		const utt = utterance.toAST();
		const trans = transition.toAST();
		const metaNodes = metas.children.map((child: any) => child.toAST());
		const inline: { let?: string; effect?: string; why?: string } = {};
		metaNodes.forEach((meta: any) => {
			if (meta.type === "let") inline.let = meta.value;
			if (meta.type === "effect") inline.effect = meta.value;
			if (meta.type === "why") inline.why = meta.value;
		});
		return {
			...utt,
			...inline,
			transition: trans,
		};
	},

	ContactUtteranceWithTransition_preferredWithMeta(
		_preferred: any,
		utterance: any,
		metas: any,
		transition: any,
	) {
		const utt = utterance.toAST();
		const trans = { ...transition.toAST(), isPreferred: true };
		const metaNodes = metas.children.map((child: any) => child.toAST());
		const inline: { let?: string; effect?: string; why?: string } = {};
		metaNodes.forEach((meta: any) => {
			if (meta.type === "let") inline.let = meta.value;
			if (meta.type === "effect") inline.effect = meta.value;
			if (meta.type === "why") inline.why = meta.value;
		});
		return {
			...utt,
			...inline,
			transition: trans,
		};
	},

	ContactUtteranceWithTransition_plain(utterance: any, transition: any) {
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

	ContactUtteranceWithTransition_preferredPlain(
		_preferred: any,
		utterance: any,
		transition: any,
	) {
		const utt = utterance.toAST();
		const trans = { ...transition.toAST(), isPreferred: true };
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

	WhyClause(_why: any, text: any) {
		return { type: "why", value: text.toAST() };
	},

	RoleClause(_role: any, text: any) {
		return { type: "role", value: text.toAST() };
	},

	Transition(arrow: any, id: any) {
		let kind = "normal";
		if (arrow.sourceString === "..>") kind = "repair";
		else if (arrow.sourceString === "=>") kind = "simultaneous";
		return {
			kind: kind,
			targetId: id.sourceString,
			isPreferred: false,
		};
	},

	dqString(_open: any, chars: any, _close: any) {
		void _close;
		return chars.sourceString;
	},

	sqString(_open: any, chars: any, _close: any) {
		void _close;
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

export interface ParsingError {
	message: string;
	line: number;
	column: number;
	position: number;
}

export const parseMolic = (input: string) => {
	try {
		const match = grammar.match(input);
		if (match.failed()) {
			// Quando há falha de parsing, colocamos na última linha onde o match chegou
			const lines = input.split("\n");
			// O índice de falha geralmente está no final
			const line = Math.max(1, lines.length);
			const lastLine = lines[lines.length - 1] || "";
			const column = lastLine.length + 1;

			const error: ParsingError = {
				message: match.message,
				line,
				column,
				position: input.length,
			};
			return { ast: null, error };
		}
		const ast = semantics(match).toAST() as DiagramAST;
		return { ast, error: null };
	} catch (e: any) {
		// Erro genérico - posição desconhecida
		const error: ParsingError = {
			message: e.message,
			line: 1,
			column: 1,
			position: 0,
		};
		return { ast: null, error };
	}
};
