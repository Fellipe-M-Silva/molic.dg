/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseMolic } from "./parser";
import { transformer } from "./transformer";

// Test case
const testCode = `scene A {}`;

console.log("=== Testing MoLIC Parser ===");
console.log("Input:", testCode);

const result = parseMolic(testCode);
console.log("Parse Result:", result);

if (result.ast) {
	console.log("AST Elements:", result.ast.elements);
	const transformed = transformer(result.ast);
	console.log("Transformed Result:", {
		nodes: transformed.nodes,
		edges: transformed.edges,
	});
}
