/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState, useRef, useEffect } from "react";
import { useNodesState, useEdgesState, type Node, type Edge } from "reactflow";

interface HistoryState {
	nodes: Node[];
	edges: Edge[];
}

const MAX_HISTORY = 30;

export const useUndoRedo = () => {
	const [nodes, setNodesBase, onNodesChange] = useNodesState([]);
	const [edges, setEdgesBase, onEdgesChange] = useEdgesState([]);

	const historyRef = useRef<HistoryState[]>([]);
	const historyIndexRef = useRef(-1);
	const isUndoRedoRef = useRef(false);
	const isDraggingRef = useRef(false);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const updateHistoryStates = useCallback(() => {
		setCanUndo(historyIndexRef.current > 0);
		setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
	}, []);

	const addToHistory = useCallback(() => {
		// Remover qualquer histórico após o índice atual (quando faz nova ação após undo)
		historyRef.current = historyRef.current.slice(
			0,
			historyIndexRef.current + 1,
		);

		// Adicionar novo estado
		historyRef.current.push({ nodes: [...nodes], edges: [...edges] });

		// Limitar tamanho do histórico
		if (historyRef.current.length > MAX_HISTORY) {
			historyRef.current.shift();
		} else {
			historyIndexRef.current++;
		}

		updateHistoryStates();
	}, [nodes, edges, updateHistoryStates]);

	// Rastrear mudanças de nodes/edges e adicionar ao histórico
	useEffect(() => {
		// Não adicionar ao histórico durante undo/redo ou durante drag
		if (isUndoRedoRef.current || isDraggingRef.current) {
			isUndoRedoRef.current = false;
			return;
		}

		addToHistory();
	}, [nodes, edges, addToHistory]);

	const undo = useCallback(() => {
		if (historyIndexRef.current > 0) {
			historyIndexRef.current--;
			const state = historyRef.current[historyIndexRef.current];
			isUndoRedoRef.current = true;
			setTimeout(() => {
				setNodesBase(state.nodes);
				setEdgesBase(state.edges);
			}, 0);
			updateHistoryStates();
		}
	}, [updateHistoryStates]);

	const redo = useCallback(() => {
		if (historyIndexRef.current < historyRef.current.length - 1) {
			historyIndexRef.current++;
			const state = historyRef.current[historyIndexRef.current];
			isUndoRedoRef.current = true;
			setTimeout(() => {
				setNodesBase(state.nodes);
				setEdgesBase(state.edges);
			}, 0);
			updateHistoryStates();
		}
	}, [updateHistoryStates]);

	const startDragHistory = useCallback(() => {
		isDraggingRef.current = true;
	}, []);

	const endDragHistory = useCallback(() => {
		isDraggingRef.current = false;
	}, []);

	return {
		nodes,
		edges,
		setNodes: setNodesBase,
		setEdges: setEdgesBase,
		onNodesChange,
		onEdgesChange,
		undo,
		redo,
		canUndo,
		canRedo,
		startDragHistory,
		endDragHistory,
	};
};
