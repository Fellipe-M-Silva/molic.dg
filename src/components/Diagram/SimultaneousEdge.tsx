import { BaseEdge, type EdgeProps, getSmoothStepPath } from 'reactflow';

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
          stroke: 'var(--text-base)',
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