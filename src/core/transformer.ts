/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkerType } from "reactflow";
import type { Node, Edge } from "reactflow";
import type { DiagramAST } from "../types/ast";

const LAYOUT = {
	NODE_WIDTH: 256,
	NODE_HEIGHT: 160,
	GAP_X: 300,
	START_X: 50,
	START_Y: 50,
};

// Lista de handles para distribuir as saídas das CENAS
const SCENE_SOURCE_HANDLES = [
	"r-2",
	"b-3",
	"r-3",
	"b-4",
	"r-1",
	"b-2",
	"b-5",
	"b-1",
];

const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "");

const getPrefix = (speaker: string) => {
	if (speaker === "user") return "u: ";
	if (speaker === "system") return "d: ";
	if (speaker === "mixed") return "du: ";
	return "";
};

const getEdgeLabel = (item: any) => {
	let text = "";
	if (item.type === "utterance") {
		const prefix = getPrefix(item.speaker);
		text = `${prefix}${item.text}`;
	} else if (item.type === "event") {
		text = `[${item.trigger}]`;
	}
	if (item.condition) {
		text += `\n(if ${item.condition})`;
	}
	return text;
};

export const transformer = (ast: DiagramAST) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	let currentX = LAYOUT.START_X;
	const currentY = LAYOUT.START_Y;

	const sourceUsageCount: Record<string, number> = {};
	const edgeIdCounter: Record<string, number> = {};

	// 1. PRE-PASS: Mapear tipos
	const nodeTypeMap: Record<string, string> = {};
	ast.elements.forEach((el: any) => {
		if (el.type === "scene" || el.type === "global")
			nodeTypeMap[el.id] = el.type;
		else if (el.type === "fork") nodeTypeMap[el.id] = "fork";
		else if (el.type === "process") nodeTypeMap[el.id] = "process";
		else if (el.type === "terminal") nodeTypeMap[el.id] = "terminal";
		else if (el.type === "external") nodeTypeMap[el.id] = "external";
		else if (el.type === "contact") nodeTypeMap[el.id] = "contact";
	});

	// Helpers
	const getNextSceneSourceHandle = (nodeId: string) => {
		const count = sourceUsageCount[nodeId] || 0;
		sourceUsageCount[nodeId] = count + 1;
		return SCENE_SOURCE_HANDLES[count % SCENE_SOURCE_HANDLES.length];
	};

	const getTargetHandle = (targetId: string, kind: string = "normal") => {
		const type = nodeTypeMap[targetId];
		if (type === "fork") return "t-1";
		if (
			["process", "terminal", "external", "contact", "global"].includes(
				type || "",
			)
		)
			return "l-1";
		return kind === "repair" ? "t-3" : "l-2";
	};

	// Helper de Aresta
	const createSceneEdge = (sourceId: string, item: any) => {
		const targetId = item.transition.targetId;
		const kind = item.transition.kind;
		const label = getEdgeLabel(item);

		const baseId = `e_${sourceId}_${targetId}_${sanitize(label)}`;
		const count = edgeIdCounter[baseId] || 0;
		edgeIdCounter[baseId] = count + 1;

		edges.push({
			id: `${baseId}_${count}`,
			source: sourceId,
			target: targetId,
			sourceHandle: getNextSceneSourceHandle(sourceId),
			targetHandle: getTargetHandle(targetId, kind),
			label: label,
			type: "smoothstep",
			animated: kind === "repair",
			style: {
				stroke:
					kind === "repair"
						? "var(--text-muted)"
						: "var(--text-base)",
				strokeDasharray: kind === "repair" ? "5, 5" : "0",
				strokeWidth: 1.5,
			},
			labelStyle: {
				fill: "var(--text-base)",
				fontWeight: 500,
				fontSize: 11,
				fontFamily: "monospace",
			},
			labelBgStyle: { fill: "var(--bg-canvas)", opacity: 0.8 },
			labelBgPadding: [4, 2],
			labelBgBorderRadius: 4,
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color:
					kind === "repair"
						? "var(--text-muted)"
						: "var(--text-base)",
			},
		});
	};

	const createForkEdge = (sourceId: string, item: any, index: number) => {
		const targetId = item.transition.targetId;
		const label = getEdgeLabel(item); // Pega "d: confira..."

		// Alterna entre os dois handles de baixo do ForkNode
		const sourceHandle = index % 2 === 0 ? "fork-out-1" : "fork-out-2";
		const targetHandle = getTargetHandle(targetId);

		const baseId = `fork_${sourceId}_${targetId}`;

		edges.push({
			id: `${baseId}_${index}`,
			source: sourceId,
			target: targetId,
			sourceHandle: sourceHandle,
			targetHandle: targetHandle,
			label: label,
			type: "smoothstep",
			style: { strokeWidth: 1.5, stroke: "var(--text-base)" },
			labelStyle: {
				fill: "var(--text-base)",
				fontWeight: 500,
				fontSize: 10,
				fontFamily: "monospace",
			},
			labelBgStyle: { fill: "var(--bg-canvas)", opacity: 0.8 },
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: "var(--text-base)",
			},
		});
	};

	// --- MAIN PASS ---
	ast.elements.forEach((element: any) => {
		// SCENE / GLOBAL / ALERT
		if (element.type === "scene" || element.type === "global") {
			const topicNode = element.content.find(
				(c: any) => c.type === "topic",
			);
			const label = topicNode ? topicNode.text : element.id;

			nodes.push({
				id: element.id,
				type: "molicNode",
				position: { x: currentX, y: currentY },
				data: {
					label: label,
					rawContent: element.content,
					isGlobal: element.type === "global",
					variant: element.variant,
					isMain: element.isMain,
				},
				style: { width: LAYOUT.NODE_WIDTH },
			});

			// CORREÇÃO: Processa APENAS as saídas explícitas (exits)
			// Removemos a recursão que entrava nos diálogos/flows
			if (element.exits) {
				element.exits.forEach((item: any) =>
					createSceneEdge(element.id, item),
				);
			}

			currentX += LAYOUT.GAP_X;
		}

		// TERMINAL
		else if (element.type === "terminal") {
			let type = "startNode";
			if (element.kind === "end") type = "endNode";
			if (element.kind === "break") type = "completionNode";

			nodes.push({
				id: element.id,
				type: type,
				position: {
					x: currentX,
					y: currentY + (element.kind === "break" ? 0 : 50),
				},
				data: { label: element.id },
			});

			if (element.kind === "start" && element.targetId) {
				edges.push({
					id: `start_${element.id}_to_${element.targetId}`,
					source: element.id,
					target: element.targetId,
					sourceHandle: "r-1",
					targetHandle: getTargetHandle(element.targetId),
					type: "smoothstep",
					style: { strokeWidth: 1.5, stroke: "var(--text-base)" },
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: "var(--text-base)",
					},
				});
			}
			currentX += element.kind === "break" ? LAYOUT.NODE_WIDTH : 150;
		}

		// FORK
		else if (element.type === "fork") {
			nodes.push({
				id: element.id,
				type: "forkNode",
				position: { x: currentX, y: currentY + 60 },
				data: { label: element.id },
			});

			// Processa o conteúdo do Fork (Utterances ou Redirects)
			if (element.content) {
				element.content.forEach((item: any, idx: number) => {
					// Se tiver transição, cria a aresta
					if (item.transition) {
						createForkEdge(element.id, item, idx);
					}
				});
			}
			currentX += 200;
		}

		// PROCESS
		else if (element.type === "process") {
			nodes.push({
				id: element.id,
				type: "processNode",
				position: { x: currentX, y: currentY + 50 },
				data: { label: element.id, action: element.action },
			});

			if (element.transition) {
				edges.push({
					id: `proc_${element.id}_to_${element.transition.targetId}`,
					source: element.id,
					target: element.transition.targetId,
					sourceHandle: "r-1",
					targetHandle: getTargetHandle(element.transition.targetId),
					type: "smoothstep",
					style: {
						strokeDasharray: "5, 5",
						stroke: "var(--text-base)",
					},
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: "var(--text-base)",
					},
				});
			}
			currentX += 150;
		}

		// EXTERNAL
		else if (element.type === "external") {
			nodes.push({
				id: element.id,
				type: "externalNode",
				position: { x: currentX, y: currentY + 50 },
				data: { label: element.id },
			});
			currentX += 128;
		}

		// CONTACT
		else if (element.type === "contact") {
			nodes.push({
				id: element.id,
				type: "contactNode",
				position: { x: currentX, y: currentY + 64 },
				data: { label: element.name },
			});

			if (element.flows) {
				element.flows.forEach((flow: any, idx: number) => {
					edges.push({
						id: `contact_${element.id}_to_${flow.targetId}_${idx}`,
						source: element.id,
						target: flow.targetId,
						sourceHandle: "r-1",
						targetHandle: getTargetHandle(flow.targetId),
						label: flow.label || "",
						type: "smoothstep",
						style: { strokeWidth: 1.5, stroke: "var(--text-base)" },
						labelStyle: {
							fill: "var(--text-base)",
							fontWeight: 500,
							fontSize: 11,
						},
						markerEnd: {
							type: MarkerType.ArrowClosed,
							color: "var(--text-base)",
						},
					});
				});
			}
			currentX += 96;
		}
	});

	return { nodes, edges };
};
