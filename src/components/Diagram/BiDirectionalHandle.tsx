import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface BiDirectionalHandleProps {
  id: string;
  position: Position;
  style?: React.CSSProperties;
  isConnectable?: boolean;
}

export const BiDirectionalHandle = memo(({ id, position, style, isConnectable = true }: BiDirectionalHandleProps) => {
  return (
    <>
      <Handle 
        type="target" 
        id={id} 
        position={position} 
        style={style} 
        isConnectable={isConnectable} 
      />
      <Handle 
        type="source" 
        id={id} 
        position={position} 
        style={{ ...style, visibility: 'hidden' }} 
        isConnectable={isConnectable} 
      /> 
    </>
  );
});