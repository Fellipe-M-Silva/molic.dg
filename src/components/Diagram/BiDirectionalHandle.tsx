import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface BiDirectionalHandleProps {
  id: string;
  position: Position;
  style?: React.CSSProperties;
}

export const BiDirectionalHandle = memo(({ id, position, style }: BiDirectionalHandleProps) => {
  return (
    <>
      <Handle 
        type="target" 
        id={id} 
        position={position} 
        style={style} 
        isConnectable={true} 
      />
      <Handle 
        type="source" 
        id={id} 
        position={position} 
        style={{ ...style, visibility: 'hidden' }} 
        isConnectable={true} 
      /> 
    </>
  );
});