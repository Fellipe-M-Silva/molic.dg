interface Token {
	type: string;
	value: string;
}

export function tokenizeMoLIC(code: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;

	while (i < code.length) {
		// Whitespace
		const wsMatch = code.slice(i).match(/^[ \t\r\n]+/);
		if (wsMatch) {
			tokens.push({ type: "whitespace", value: wsMatch[0] });
			i += wsMatch[0].length;
			continue;
		}

		// Comments (line)
		if (code[i] === "/" && code[i + 1] === "/") {
			const match = code.slice(i).match(/^\/\/.*$/m);
			if (match) {
				tokens.push({ type: "comment", value: match[0] });
				i += match[0].length;
				continue;
			}
		}

		// Comments (line with %)
		if (code[i] === "%") {
			const match = code.slice(i).match(/^%.*$/m);
			if (match) {
				tokens.push({ type: "comment", value: match[0] });
				i += match[0].length;
				continue;
			}
		}

		// Comments (block)
		if (code[i] === "/" && code[i + 1] === "*") {
			const match = code.slice(i).match(/^\/\*[\s\S]*?\*\//);
			if (match) {
				tokens.push({ type: "comment", value: match[0] });
				i += match[0].length;
				continue;
			}
		}

		// Strings (double quotes)
		if (code[i] === '"') {
			const match = code.slice(i).match(/^"([^"\\]|\\.)*"/);
			if (match) {
				tokens.push({ type: "string", value: match[0] });
				i += match[0].length;
				continue;
			}
		}

		// Strings (single quotes)
		if (code[i] === "'") {
			const match = code.slice(i).match(/^'([^'\\]|\\.)*'/);
			if (match) {
				tokens.push({ type: "string", value: match[0] });
				i += match[0].length;
				continue;
			}
		}

		// Clauses with colon (topic:, subtopic:, let:, why:, effect:, when:, if:, role:)
		const clauseMatch = code
			.slice(i)
			.match(/^\b(topic|subtopic|let|why|effect|when|if|role):/);
		if (clauseMatch) {
			tokens.push({ type: "keyword.clause", value: clauseMatch[0] });
			i += clauseMatch[0].length;
			continue;
		}

		// Node types (scene, global, fork, process, external, contact)
		const nodeMatch = code
			.slice(i)
			.match(/^\b(scene|global|fork|process|external|contact)\b/i);
		if (nodeMatch) {
			tokens.push({ type: "keyword.struct", value: nodeMatch[0] });
			i += nodeMatch[0].length;
			continue;
		}

		// Keywords (start, end, break, main, preferred, alert)
		const kwMatch = code
			.slice(i)
			.match(/^\b(start|end|break|main|preferred|alert)\b/i);
		if (kwMatch) {
			tokens.push({ type: "keyword", value: kwMatch[0] });
			i += kwMatch[0].length;
			continue;
		}

		// Flow keywords (seq, xor, or, and, dialog)
		const flowMatch = code.slice(i).match(/^\b(seq|xor|or|and|dialog)\b/i);
		if (flowMatch) {
			tokens.push({ type: "keyword.flow", value: flowMatch[0] });
			i += flowMatch[0].length;
			continue;
		}

		// Speakers (u:, d:, du:, anon:)
		const speakerMatch = code.slice(i).match(/^\b(u|d|du|anon):/);
		if (speakerMatch) {
			tokens.push({ type: "keyword.speaker", value: speakerMatch[0] });
			i += speakerMatch[0].length;
			continue;
		}

		// Arrows (=>, ->, ..>)
		const arrowMatch = code.slice(i).match(/^(=>|->|\.\.>)/);
		if (arrowMatch) {
			tokens.push({ type: "operator.arrow", value: arrowMatch[0] });
			i += arrowMatch[0].length;
			continue;
		}

		// Identifiers and keywords
		const idMatch = code.slice(i).match(/^[a-z_][a-z0-9_]*/i);
		if (idMatch) {
			tokens.push({ type: "identifier", value: idMatch[0] });
			i += idMatch[0].length;
			continue;
		}

		// Numbers
		const numMatch = code.slice(i).match(/^\d+(\.\d+)?/);
		if (numMatch) {
			tokens.push({ type: "number", value: numMatch[0] });
			i += numMatch[0].length;
			continue;
		}

		// Brackets
		if (/[\[\]{}()]/.test(code[i])) {
			tokens.push({ type: "bracket", value: code[i] });
			i++;
			continue;
		}

		// Operators
		if (/[=:]/.test(code[i])) {
			tokens.push({ type: "operator", value: code[i] });
			i++;
			continue;
		}

		// Single character
		tokens.push({ type: "text", value: code[i] });
		i++;
	}

	return tokens;
}

export function getTokenClassName(tokenType: string): string {
	const classMap: Record<string, string> = {
		"keyword.clause": "syntax-keyword-clause",
		"keyword.struct": "syntax-keyword-struct",
		"keyword.flow": "syntax-keyword-flow",
		"keyword.speaker": "syntax-keyword-speaker",
		keyword: "syntax-keyword",
		"operator.arrow": "syntax-operator-arrow",
		operator: "syntax-operator",
		string: "syntax-string",
		comment: "syntax-comment",
		number: "syntax-number",
		identifier: "syntax-identifier",
		bracket: "syntax-bracket",
		whitespace: "",
		text: "",
	};

	return classMap[tokenType] || "";
}
