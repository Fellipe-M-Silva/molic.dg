/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from 'react';
import { Position, type NodeProps } from 'reactflow';
import { BiDirectionalHandle } from './BiDirectionalHandle';
import { type ContentNode, type FlowControlNode } from '../../types/ast';
import './MolicNode.css'; 

const POSITIONS = {
  basic: { '1': '25%', '2': '75%', '3': '50%' },
  scene: { '1': '10%', '2': '30%', '3': '50%', '4': '70%', '5': '90%' }
};

const HandleSet = ({ isScene }: { isScene: boolean }) => {
  const posMap = isScene ? POSITIONS.scene : POSITIONS.basic;
  const indices = isScene ? ['1', '2', '3', '4', '5'] : ['1', '2', '3'];

  const getStyle = (i: string, isVertical: boolean) => {
    const val = (posMap as any)[i]; 
    return isVertical ? { left: val } : { top: val };
  };

  return (
    <>
      {indices.map(i => <BiDirectionalHandle key={`t-${i}`} id={`t-${i}`} position={Position.Top} style={getStyle(i, true)} />)}
      {indices.map(i => <BiDirectionalHandle key={`b-${i}`} id={`b-${i}`} position={Position.Bottom} style={getStyle(i, true)} />)}
      {indices.map(i => <BiDirectionalHandle key={`l-${i}`} id={`l-${i}`} position={Position.Left} style={getStyle(i, false)} />)}
      {indices.map(i => <BiDirectionalHandle key={`r-${i}`} id={`r-${i}`} position={Position.Right} style={getStyle(i, false)} />)}
    </>
  );
};

const renderContent = (items: ContentNode[]) => {
  return items.map((item, index) => {
    if (item.type === 'topic') return <div key={index} className='molic-topic'>{item.text}</div>;
    if (item.type === 'let') return <div key={index} className="molic-let"><strong>let</strong> {`{ ${item.variable}: ${item.value} }`}</div>;
    if (item.type === 'why') return <div key={index} className="molic-why"><strong>Why:</strong> {item.text}</div>;
    if (item.type === 'utterance') return null;

    if (item.type === 'flow') {
      const type = item.variant.toUpperCase();
      const condition = item.condition ? `(if ${item.condition})` : null;
      const isDefault = (item as FlowControlNode).isDefaultLayer;
      const className = isDefault ? 'molic-flow default-layer' : `molic-flow ${item.variant}`;

      return (
        <div key={index} className={className}>
          {!isDefault && (
            <div className="molic-flow-label">
              <span className="molic-flow-type">{type}</span>
              {condition && <span className="molic-utterance-cond">{condition}</span>}
            </div>
          )}
          <div className="molic-flow-content">{item.children && renderContent(item.children)}</div>
        </div>
      );
    }
    if (item.type === 'dialog') return <div key={index} className="molic-dialog">{item.children && renderContent(item.children)}</div>;
    if (item.type === 'event' && !(item as any).transition) return <div key={index} className="molic-event">⚡ {item.trigger}</div>;
    return null;
  });
};

export const MolicNode = memo(({ data, selected }: NodeProps) => {
  const visibleContent = useMemo(() => {
    if (!data.rawContent) return [];
    return data.rawContent.filter((item: ContentNode) => item.type !== 'topic' && item.type !== 'utterance');
  }, [data.rawContent]);

  const type = data.nodeType || 'scene';
  const isGlobal = type === 'global';
  const isSceneLike = type === 'scene' || isGlobal; 
  
  const classes = [
    'molic-node',
    selected ? 'selected' : '',
    isGlobal ? 'global' : '',
    data.variant === 'alert' ? 'alert' : '',
    data.isMain ? 'main' : '',
    type === 'startNode' ? 'terminal start' : '',
    type === 'endNode' ? 'terminal end' : '',
    type === 'completionNode' ? 'terminal completion' : '',
    type === 'forkNode' ? 'fork' : '',
    type === 'processNode' ? 'process' : '',
    type === 'externalNode' ? 'external' : '',
    type === 'contactNode' ? 'contact' : '',
  ].filter(Boolean).join(' ');

  if (isGlobal) {
    return (
      <div className={classes} style={{ minHeight: '80px', minWidth: '150px' }}>
        <div className="global-label">Global Context</div>
        <HandleSet isScene={true} />
      </div>
    );
  }

  if (!isSceneLike) {
    return (
      <div className={classes}>
        {type === 'endNode' && <div className="terminal-double-circle"><div className="inner" /></div>}
        {type === 'completionNode' && <div className="completion-line" />}
        {type === 'processNode' && <div className="process-box" />}
        {type === 'externalNode' && <div className="external-shape"><span className="external-label">{data.label}</span></div>}
        {type === 'contactNode' && <><div className="contact-icon">user</div><span className="contact-label">{data.label}</span></>}
        
        {['startNode', 'forkNode'].includes(type) && (
           <div style={{ textAlign: 'center', padding: '4px', fontWeight: 'bold' }}>{data.label}</div>
        )}
        <HandleSet isScene={false} />
      </div>
    );
  }

  const hasBody = visibleContent.length > 0;
  return (
    <div className={classes}>
      <div className="molic-node-header">{data.label}</div>
      {hasBody && <div className="molic-node-body">{renderContent(data.rawContent)}</div>}
      <HandleSet isScene={true} />
    </div>
  );
});