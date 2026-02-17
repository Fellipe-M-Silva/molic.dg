import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getSmoothStepPath, 
  type EdgeProps 
} from 'reactflow';

import './MolicEdge.css';

export const MolicEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) => {
  // 1. Calcula o caminho da linha (SmoothStep = ângulos retos curvos)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* A Linha da Aresta (SVG) */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {/* O Label da Aresta (HTML Overlay) */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              // Centraliza o label nas coordenadas calculadas (labelX, labelY)
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              // Garante que o label fique acima das linhas e nós, mas não bloqueie tudo
              pointerEvents: 'all',
              zIndex: 10, 
            }}
            className="nodrag nopan" // Permite selecionar texto dentro do label sem arrastar o mapa
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const SimultaneousEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        id={`${id}_outer`}
        style={{
          ...style,
          strokeWidth: 12,
          stroke: 'var(--border-edge)',
        }}
      />
      
      <BaseEdge
        path={edgePath}
        id={`${id}_inner`}
        style={{
          ...style,
          strokeWidth: 10,
          stroke: 'var(--bg-canvas)', 
        }}
        markerEnd={markerEnd}
      />
    </>
  );
};