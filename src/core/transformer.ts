/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkerType } from "reactflow";
import type { Node, Edge } from "reactflow";
import type { DiagramAST, ContentNode } from "../types/ast";

const LAYOUT = {
	NODE_WIDTH: 256,
	NODE_HEIGHT: 160,
	GAP_X: 320,
	START_X: 0,
	START_Y: 0,
};

export const transformer = (ast: DiagramAST) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	let currentX = LAYOUT.START_X;

	const extractEdgesFromContent = (
		sourceId: string,
		contents: ContentNode[],
	) => {
		contents.forEach((item) => {
			if (item.type === "utterance" && item.transition) {
				const targetId = item.transition.targetId;
				const isRepair = item.transition.kind === "repair";

				edges.push({
					id: `e_${sourceId}_to_${targetId}_${Math.random().toString(36).substr(2, 5)}`,
					source: sourceId,
					target: targetId,
					label: item.text,

					type: "smoothstep",
					animated: isRepair,
					style: {
						stroke: isRepair
							? "var(--text-muted)"
							: "var(--text-base)",
						strokeDasharray: isRepair ? "5, 5" : "0",
						strokeWidth: 1.5,
					},
					labelStyle: { fill: "var(--text-base)", fontWeight: 500 },
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: isRepair
							? "var(--text-muted)"
							: "var(--text-base)",
					},
				});
			}

			if (item.type === "event" && item.transition) {
				edges.push({
					id: `evt_${sourceId}_${item.transition.targetId}`,
					source: sourceId,
					target: item.transition.targetId,
					label: `[${item.trigger}]`,
					style: { stroke: "var(--primary)" },
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: "var(--primary)",
					},
				});
			}

			if (item.type === "flow" && item.children) {
				extractEdgesFromContent(sourceId, item.children);
			}
		});
	};

	ast.elements.forEach((element) => {
		const topicNode = element.content.find((c: any) => c.type === "topic");
		// @ts-expect-error: topicNode.text é tratado como ASTNode na definição mas aqui sabemos que é string
		const label = topicNode ? topicNode.text : element.id;

		nodes.push({
			id: element.id,
			type: element.type === "global" ? "default" : "input",
			position: { x: currentX, y: LAYOUT.START_Y },
			data: {
				label: label,
				rawContent: element.content,
			},
			style: {
				width: LAYOUT.NODE_WIDTH,
				backgroundColor:
					element.type === "global"
						? "var(--bg-alt)"
						: "var(--bg-base)",
				border: "1px solid var(--border-base)",
				color: "var(--text-base)",
				borderRadius: "8px",
				padding: "10px",
				boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
				textAlign: "center",
			},
		});

		extractEdgesFromContent(element.id, element.content);

		currentX += LAYOUT.GAP_X;
	});

	return { nodes, edges };
};
