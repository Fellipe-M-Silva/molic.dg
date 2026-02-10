import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { type ContentNode } from '../../types/ast';
import './MolicNode.css'; 

const renderContent = (items: ContentNode[]) => {
  return items.map((item, index) => {
    
    // 1. TOPIC (Sub-tópicos dentro de dialogs)
    if (item.type === 'topic') {
      return <div key={index} className='molic-topic'>{item.text}</div>;
    }

    // 2. LET (Variáveis)
    if (item.type === 'let') {
      return (
        <div key={index} className="molic-let">
          <strong>let</strong> {`{ ${item.variable}: ${item.value} }`}
        </div>
      );
    }

    // 3. WHY (Racional)
    if (item.type === 'why') {
      return <div key={index} className="molic-why"><strong>Why:</strong> {item.text}</div>;
    }

    // 4. UTTERANCES (u, d, du) com Condicional
    if (item.type === 'utterance') {
      let prefix = '';
      let styleClass = 'molic-utterance';
      if (item.speaker === 'user') { prefix = 'u:'; styleClass += ' user'; }
      else if (item.speaker === 'system') { prefix = 'd:'; styleClass += ' system'; }
      else { prefix = 'd+u:'; styleClass += ' mixed'; } // d+u explícito
      
      return (
        <div key={index} className={styleClass}>
          <span className="molic-prefix">{prefix}</span>
          <span>{item.text}</span>
          {item.condition && <span className="molic-utterance-cond">(if {item.condition})</span>}
        </div>
      );
    }

    // 5. FLUXOS (AND, SEQ, OR, XOR) - Recursivo
    if (item.type === 'flow') {
      const type = item.variant.toUpperCase();
      const condition = item.condition ? `(if ${item.condition})` : null;
      
      return (
        <div key={index} className={`molic-flow ${item.variant}`}>
          <div className="molic-flow-label">
            <span className="molic-flow-type">{type}</span>
            {condition && <span className="molic-utterance-cond">{condition}</span>}
          </div>
          <div className="molic-flow-content">
            {/* RECURSÃO AQUI */}
            {item.children && renderContent(item.children)}
          </div>
        </div>
      );
    }

    // 6. DIALOG (Agrupamento Visual)
    if (item.type === 'dialog') {
      return (
        <div key={index} className="molic-dialog">
          {item.children && renderContent(item.children)}
        </div>
      );
    }

    if (item.type === 'event') return <div key={index} className="molic-event">⚡ {item.trigger}</div>;
    
    return null;
  });
};

export const MolicNode = memo(({ data, selected }: NodeProps) => {
  const isGlobal = data.isGlobal;
  const isAlert = data.variant === 'alert';
  const isMain = data.isMain;
  const visibleContent = useMemo(() => {
    if (!data.rawContent) return [];
    return data.rawContent.filter((item: ContentNode) => item.type !== 'topic');
  }, [data.rawContent]);

  const hasContent = visibleContent.length > 0;

  const classes = [
    'molic-node',
    selected ? 'selected' : '',
    isGlobal ? 'global' : '',
    isAlert ? 'alert' : '',
    isMain ? 'main' : '',
    !hasContent ? 'collapsed' : ''
  ].filter(Boolean).join(' ');

  // --- CONFIGURAÇÃO GLOBAL (Minimalista) ---
  if (isGlobal) {
    return (
      <div className={classes}
      >
        <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', color: 'var(--text-muted)' }}>
        </div>
        <Handle type="target" position={Position.Top} id="t-1" />
        <Handle type="target" position={Position.Left} id="l-1" />
        <Handle type="source" position={Position.Right} id="r-1" />
        <Handle type="source" position={Position.Bottom} id="b-1" />
      </div>
    );
  }

  // --- CONFIGURAÇÃO CENA NORMAL (Inalterada) ---
  return (
    <div className={classes}>
      <Handle type="target" position={Position.Top} id="t-1" style={{ left: '10%' }} />
      <Handle type="target" position={Position.Top} id="t-2" style={{ left: '30%' }} />
      <Handle type="target" position={Position.Top} id="t-3" style={{ left: '50%' }} />
      <Handle type="target" position={Position.Top} id="t-4" style={{ left: '70%' }} />
      <Handle type="target" position={Position.Top} id="t-5" style={{ left: '90%' }} />

      <Handle type="target" position={Position.Left} id="l-1" style={{ top: '25%' }} />
      <Handle type="target" position={Position.Left} id="l-2" style={{ top: '50%' }} />
      <Handle type="target" position={Position.Left} id="l-3" style={{ top: '75%' }} />

      <div className="molic-node-header">{data.label}</div>
      {hasContent && (
        <div className="molic-node-body">
          {renderContent(data.rawContent)}
        </div>
      )}

      <Handle type="source" position={Position.Right} id="r-1" style={{ top: '25%' }} />
      <Handle type="source" position={Position.Right} id="r-2" style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} id="r-3" style={{ top: '75%' }} />

      <Handle type="source" position={Position.Bottom} id="b-1" style={{ left: '10%' }} />
      <Handle type="source" position={Position.Bottom} id="b-2" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="b-3" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="b-4" style={{ left: '70%' }} />
      <Handle type="source" position={Position.Bottom} id="b-5" style={{ left: '90%' }} />
    </div>
  );
});