import type { languages } from "monaco-editor";

export const molicConfiguration: languages.LanguageConfiguration = {
	comments: {
		lineComment: "//",
		blockComment: ["/*", "*/"],
	},
	brackets: [
		["{", "}"],
		["(", ")"],
		["[", "]"],
	],
	autoClosingPairs: [
		{ open: "{", close: "}" },
		{ open: "(", close: ")" },
		{ open: "[", close: "]" },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
	],
	surroundingPairs: [
		{ open: "{", close: "}" },
		{ open: "(", close: ")" },
		{ open: "[", close: "]" },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
	],
};

export const molicLanguage: languages.IMonarchLanguage = {
	defaultToken: "",
	tokenPostfix: ".molic",

	// Tipos de nó
	nodeTypes: ["scene", "global", "fork", "process", "external", "contact"],

	// Keywords estruturais
	keywords: ["start", "end", "break", "main"],

	// Fluxo de controle
	flowKeywords: ["seq", "xor", "or", "and", "dialog", "if"],

	// Cláusulas (usam ":")
	clauses: ["let", "when", "why", "effect", "if"],

	speakers: ["u", "d", "du", "anon"],

	// Símbolos comuns
	symbols: /[=><!~?:&|+\-*\/\^%]+/,

	tokenizer: {
		root: [
			// Cláusulas especiais com ":" (let:, why:, effect:, when:, if:)
			[/\b(let|why|effect|when|if):\s/, "keyword.clause"],

			// Tipos de nó (scene, global, fork, process, external, contact)
			[
				/\b(scene|global|fork|process|external|contact)\b/i,
				"keyword.struct",
			],

			// Keywords estruturais
			[/\b(start|end|break|main)\b/i, "keyword"],

			// Fluxo de controle (seq, xor, or, and, dialog) - NÃO include 'if' aqui
			[/\b(seq|xor|or|and|dialog)\b/i, "keyword.flow"],

			// Speakers (u:, d:, du:, anon:)
			[/\b(u|d|du|anon):/, "keyword.speaker"],

			// Transições (=>, -> e ..>)
			[/(=>|->|\.\.>)/, "operator.arrow"],

			// Identificadores
			[/[a-z_][a-z0-9_]*/i, "identifier"],

			// Números
			[/\b\d+(\.\d+)?\b/, "number"],

			// Espaços em branco
			{ include: "@whitespace" },

			// Delimitadores
			[/[{}()\[\]]/, "@brackets"],

			// Operadores
			[/[=:]/, "operator"],

			// Strings com aspas duplas
			[/"([^"\\]|\\.)*$/, "string.invalid"],
			[/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

			// Strings com aspas simples
			[/'([^'\\]|\\.)*$/, "string.invalid"],
			[
				/'/,
				{
					token: "string.quote",
					bracket: "@open",
					next: "@stringSingle",
				},
			],

			// Comentários de linha
			[/\/\/.*$/, "comment"],

			// Comentários de bloco
			[/\/\*/, "comment", "@comment"],
		],

		comment: [
			[/[^\/*]+/, "comment"],
			[/\/\*/, "comment", "@push"],
			[/\*\//, "comment", "@pop"],
			[/[\/*]/, "comment"],
		],

		string: [
			[/[^\\"]+/, "string"],
			[/\\./, "string.escape"],
			[/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
		],

		stringSingle: [
			[/[^\\']+/, "string"],
			[/\\./, "string.escape"],
			[/'/, { token: "string.quote", bracket: "@close", next: "@pop" }],
		],

		whitespace: [
			[/[ \t\r\n]+/, "white"],
			[/\/\*/, "comment", "@comment"],
			[/\/\/.*$/, "comment"],
		],
	},
};
