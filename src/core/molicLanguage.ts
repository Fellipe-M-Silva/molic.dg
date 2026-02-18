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

	keywords: [
		"scene",
		"global",
		"fork",
		"process",
		"external",
		"contact",
		"start",
		"end",
		"break",
		"main",
		"alert",
		"let",
	],

	flowKeywords: ["seq", "xor", "or", "and", "dialog", "if"],

	attributes: ["topic", "role", "why", "when"],

	speakers: ["u", "d", "du"],

	operators: ["=", "->", "..>", ":"],

	// Símbolos comuns
	symbols: /[=><!~?:&|+\-*\/\^%]+/,

	tokenizer: {
		root: [
			// Identificadores e palavras-chave
			[
				/[a-z_$][\w$]*/,
				{
					cases: {
						"@keywords": "keyword",
						"@flowKeywords": "keyword.flow",
						"@attributes": "keyword.attribute",
						"@speakers": "keyword.speaker",
						"@default": "identifier",
					},
				},
			],

			// Espaços em branco
			{ include: "@whitespace" },

			// Delimitadores e operadores
			[/[{}()\[\]]/, "@brackets"],
			[
				/@symbols/,
				{
					cases: {
						"@operators": "operator",
						"@default": "",
					},
				},
			],

			// Strings
			[/"([^"\\]|\\.)*$/, "string.invalid"], // string não terminada
			[/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
			[
				/'/,
				{
					token: "string.quote",
					bracket: "@open",
					next: "@stringSingle",
				},
			],
		],

		comment: [
			[/[^\/*]+/, "comment"],
			[/\/\*/, "comment", "@push"], // nested comments
			["\\*/", "comment", "@pop"],
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
