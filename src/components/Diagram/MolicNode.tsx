/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from 'react';
import { Position, type NodeProps } from 'reactflow';
import { BiDirectionalHandle } from './BiDirectionalHandle';
import { type ContentNode, type FlowControlNode, type SubtopicNode } from '../../types/ast';
import { useReconnectionContext } from '../../hooks/useReconnectionContext';
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

const ForkHandleSet = () => {
  return (
    <>
      <BiDirectionalHandle id="t-1" position={Position.Top} style={{ left: '50%' }} />
      <BiDirectionalHandle id="b-2" position={Position.Bottom} style={{ left: '30%' }} />
      <BiDirectionalHandle id="b-3" position={Position.Bottom} style={{ left: '70%' }} />
    </>
  );
};

const renderContent = (items: ContentNode[]) => {
  return items.map((item, index) => {
    if (item.type === 'topic') return null; // Topic é apenas header, não renderizar aqui
    if (item.type === 'subtopic') return <div key={index} className="molic-subtopic">{(item as SubtopicNode).text}</div>;
    if (item.type === 'let') return <div key={index} className="molic-let"><strong>let:</strong> {item.value}</div>;
    if (item.type === 'effect') return <div key={index} className="molic-effect"><strong>effect:</strong> {(item as any).value}</div>;
    if (item.type === 'why') return <div key={index} className="molic-why"><strong>why:</strong> {(item as any).value}</div>;
    
    // Renderiza apenas utterances sem transição (internas)
    if (item.type === 'utterance') {
      const utt = item as any;
      if (utt.transition) return null; // Ignore utterances com transição (vão gerar arestas)
      if (utt.speaker === 'anonymous') return null; // Ignore utterances anônimas (sem conteúdo)
      
      const prefix = utt.speaker === 'user' ? 'u' : utt.speaker === 'mixed' ? 'd+u' : 'd';
      const condText = utt.condition ? ` (if: ${utt.condition})` : '';
      const whenText = utt.when ? ` when: ${utt.when}` : '';
      return (
        <div key={index} className="molic-utterance">
          <div className="molic-utterance-main">
            <strong>{prefix}:</strong> {utt.text}<span className='molic-utterance-cond'>{condText}{whenText}</span>
          </div>
        </div>
      );
    }

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

export const MolicNode = memo(({ data, selected, id }: NodeProps) => {
  const { isReconnecting, sourceNodeId, targetNodeId } = useReconnectionContext();
  const isInvolvedInReconnection = isReconnecting && (id === sourceNodeId || id === targetNodeId);
  
  const visibleContent = useMemo(() => {
    if (!data.rawContent) return [];
    return data.rawContent.filter((item: ContentNode) => {
      // Não conta como body: topic, let, effect, why, utterances com transição
      if (item.type === 'topic') return false;
      if (item.type === 'let' || item.type === 'effect' || item.type === 'why') return false;
      if (item.type === 'utterance' && (item as any).transition) return false;
      if (item.type === 'event' && (item as any).transition) return false;
      // Conta como body: subtopic, flow, utterances sem transição, dialog
      return true;
    });
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
    type === 'breakNode' ? 'break' : '',
    type === 'forkNode' ? 'fork' : '',
    type === 'processNode' ? 'process' : '',
    type === 'externalNode' ? 'external' : '',
    type === 'contactNode' ? 'contact' : '',
    isInvolvedInReconnection ? 'reconnecting' : '',
  ].filter(Boolean).join(' ');

  if (isGlobal) {
    return (
      <div className={classes} style={{ minHeight: '48px', minWidth: '150px' }}>
        <HandleSet isScene={true} />
      </div>
    );
  }

  if (!isSceneLike) {
    return (
      <div className={classes}>
        {type === 'endNode' && <div className="terminal-double-circle"><div className="inner" /></div>}
        {type === 'completionNode' && <div className="completion-line" />}
        {type === 'breakNode' && <div className="break-box"><div className="break-line" /></div>}
        {type === 'processNode' && <div className="process-box" />}
        {type === 'forkNode' && <div className="fork-bar" />}
        {type === 'contactNode' && <><div className="contact-icon">user</div><span className="contact-label">{data.label}</span></>}
        
        {type === 'forkNode' ? <ForkHandleSet /> : <HandleSet isScene={false} />}
      </div>
    );
  }

  const hasBody = visibleContent.length > 0;
  return (
    <div className={classes}>
      <div className={`molic-node-header ${!hasBody ? 'empty' : ''}`}>{data.label}</div>
      {hasBody && <div className="molic-node-body">{renderContent(data.rawContent)}</div>}
      <HandleSet isScene={true} />
    </div>
  );
});