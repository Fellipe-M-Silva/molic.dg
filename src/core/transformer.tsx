/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { MarkerType } from "reactflow";
import type { Node, Edge } from "reactflow";
import type { DiagramAST } from "../types/ast";

const LAYOUT = { NODE_WIDTH: 256, NODE_HEIGHT: 160, GAP_X: 300, START_X: 50, START_Y: 50 };
const SCENE_SOURCE_HANDLES = ["r-2", "b-3", "r-3", "b-4", "r-1", "b-2", "b-5", "b-1"];
const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "");

const getBasePrefix = (speaker: string) => {
  if (speaker === "user") return "u: ";
  if (speaker === "system") return "d: ";
  if (speaker === "mixed") return "d+u: ";
  return "";
};

const getEdgeLabelJSX = (item: any, validationError?: string, overridePrefix?: string): React.ReactNode | null => {
  if (validationError) return <div className="molic-edge-label-container error">🚫 {validationError}</div>;
  if (item.transition?.kind === "simultaneous") return null;

  const lines: React.ReactNode[] = [];
  const { type, trigger, speaker, text, condition, when, let: letVar, effect, why } = item;
  const transitionWhy = item.transition?.why;
  const whyValue = transitionWhy ?? why;

  const whenText = type === "event" ? trigger : when;
  if (whenText) {
    lines.push(
      <div key="when" className="molic-edge-label-line meta" style={{ fontWeight: 600, color: '#d48806' }}>
        when: {whenText}
      </div>
    );
  }

  if (condition !== undefined) {
    lines.push(
      <div key="cond" className="molic-edge-label-line meta">
        if: {condition ?? ""}
      </div>
    );
  }

  if (type === "utterance") {
    let mainText = "";
    const prefix = overridePrefix ? `${overridePrefix}: ` : getBasePrefix(speaker);
    if (speaker === "system" || speaker === "mixed") {
      mainText = `${prefix}${text || ''}`;
    } else {
      mainText = `${prefix}${text || ''}`;
    }
    if (mainText) lines.push(<div key="main" className="molic-edge-label-line main">{mainText}</div>);
  }

  if (letVar) lines.push(<div key="let" className="molic-edge-label-line meta">let: {letVar}</div>);
  if (effect) lines.push(<div key="effect" className="molic-edge-label-line meta">effect: {effect}</div>);
  if (whyValue) lines.push(<div key="why" className="molic-edge-label-line meta">why: {whyValue}</div>);

  if (lines.length === 0) return null;
  return <div className="molic-edge-label-container">{lines}</div>;
};

export const transformer = (ast: DiagramAST) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  let currentX = LAYOUT.START_X;
  const currentY = LAYOUT.START_Y;

  const sourceUsageCount: Record<string, number> = {};
  const edgeIdCounter: Record<string, number> = {};
  const nodeTypeMap: Record<string, string> = {};

  ast.elements.forEach((el: any) => {
    if (el.type === 'scene' || el.type === 'global') nodeTypeMap[el.id] = 'scene';
    else if (el.type === 'terminal' && el.kind === 'start') nodeTypeMap[el.id] = 'start'; 
    else nodeTypeMap[el.id] = el.type;
  });

  const getNextSceneSourceHandle = (nodeId: string) => {
    const count = sourceUsageCount[nodeId] || 0;
    sourceUsageCount[nodeId] = count + 1;
    return SCENE_SOURCE_HANDLES[count % SCENE_SOURCE_HANDLES.length];
  };

  const getTargetHandle = (targetId: string, kind: string = 'normal') => {
    const type = nodeTypeMap[targetId];
    if (type === 'fork') return 't-1';
    if (['process', 'terminal', 'external', 'contact', 'global'].includes(type || '')) return 'l-1';
    return kind === 'repair' ? 't-3' : 'l-2'; 
  };

  const createEdge = (sourceId: string, item: any, sourceRoleName?: string, forcedSourceHandle?: string) => {
    if (!item.transition) return;

    const targetId = item.transition.targetId;
    const sourceType = nodeTypeMap[sourceId];
    const targetType = nodeTypeMap[targetId];
    
    let kind = item.transition.kind;
    const isInteractionMediated = sourceType === 'contact' || targetType === 'contact' || targetType === 'external';
    if (isInteractionMediated) kind = 'mediated';

    const isPreferred = item.transition.isPreferred;

    let sourceHandle = forcedSourceHandle;
    if (!sourceHandle) {
        if (sourceType === 'scene') sourceHandle = getNextSceneSourceHandle(sourceId);
        else sourceHandle = "r-1"; 
    }

    const labelJSX = getEdgeLabelJSX(item, undefined, sourceRoleName);
    const baseId = `e_${sourceId}_${targetId}_${sanitize(item.text || "")}`;
    const count = edgeIdCounter[baseId] || 0;
    edgeIdCounter[baseId] = count + 1;

    let markerEnd: any = { type: MarkerType.ArrowClosed, color: "var(--text-base)" };
    if (kind === 'mediated') markerEnd = "double-arrowhead";
    else if (kind === 'simultaneous') markerEnd = undefined;

    edges.push({
      id: `${baseId}_${count}`,
      source: sourceId,
      target: targetId,
      sourceHandle: sourceHandle,
      targetHandle: getTargetHandle(targetId, kind),
      label: labelJSX,
      type: kind === 'simultaneous' ? 'simultaneous' : 'molic', 
      className: kind,
      style: {
        strokeWidth: isPreferred ? 3 : 1.5,
        strokeDasharray: (kind !== 'simultaneous' && kind === 'repair') ? "5, 5" : "0",
      },
      markerEnd: markerEnd,
    } as Edge);
  };

  ast.elements.forEach((element: any) => {
    if (element.type === "scene" || element.type === "global") {
      const isGlobal = element.type === "global";
      nodes.push({
        id: element.id,
        type: "molicNode",
        position: { x: currentX, y: currentY },
        data: {
          label: element.label || element.id,
          nodeType: isGlobal ? 'global' : 'scene', 
          isGlobal: isGlobal,
          isMain: element.isMain,
          variant: element.variant,
          rawContent: element.content, 
        },
        style: { width: LAYOUT.NODE_WIDTH },
      });
      if (element.exits) element.exits.forEach((item: any) => createEdge(element.id, item));
      currentX += LAYOUT.GAP_X;
    }
    else if (element.type === "terminal" && element.kind === "start") {
      nodes.push({ id: element.id, type: "molicNode", position: { x: currentX, y: currentY + 50 }, data: { label: element.id, nodeType: 'startNode' } });
      if (element.content) element.content.forEach((item: any) => createEdge(element.id, item, undefined, "r-1"));
      currentX += 150;
    }
    else if (element.type === "contact") {
      nodes.push({ id: element.id, type: "molicNode", position: { x: currentX, y: currentY + 64 }, data: { label: element.name, nodeType: 'contactNode' } });
      if (element.content) element.content.forEach((item: any) => createEdge(element.id, item, element.name, "r-1"));
      currentX += 96;
    }
    else if (element.type === "process") {
        nodes.push({ id: element.id, type: "molicNode", position: { x: currentX, y: currentY + 50 }, data: { label: element.id, nodeType: 'processNode' } });
        if (element.content) element.content.forEach((item: any) => createEdge(element.id, item, undefined, "r-1"));
        currentX += 150;
    }
    else if (element.type === "fork") {
      nodes.push({ id: element.id, type: "molicNode", position: { x: currentX, y: currentY + 60 }, data: { label: element.id, nodeType: 'forkNode' } });
      if(element.content) {
        let forkIndex = 0;
        element.content.forEach((item:any) => {
          if(!item.transition) return;
          const handle = forkIndex === 0 ? 'b-2' : 'b-3';
          createEdge(element.id, item, undefined, handle);
          forkIndex++;
        });
      }
      currentX += 200;
    }
    else if (element.type === "external") {
        nodes.push({ id: element.id, type: "molicNode", position: { x: currentX, y: currentY + 50 }, data: { label: element.id, nodeType: 'externalNode' } });
        currentX += 128;
    }
    else if (element.type === "terminal") { 
        const type = element.kind === "end" ? "endNode" : element.kind === "break" ? "breakNode" : "completionNode";
        nodes.push({ id: element.id, type: "molicNode", position: { x: currentX, y: currentY }, data: { label: element.id, nodeType: type } });
        currentX += 150;
    }
  });

  return { nodes, edges };
};