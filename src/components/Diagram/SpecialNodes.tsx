import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

// --- START NODE (4 Saídas) ---
export const StartNode = memo(({ selected }: NodeProps) => (
  <div className={`special-node start-node ${selected ? 'selected' : ''}`}>
    <Handle type="source" position={Position.Right} id="r-1" />
    <Handle type="source" position={Position.Bottom} id="b-1" />
    <Handle type="source" position={Position.Top} id="t-1" />
    <Handle type="source" position={Position.Left} id="l-1" />
  </div>
));

// --- END NODE (4 Entradas) ---
export const EndNode = memo(({ selected }: NodeProps) => (
  <div className={`special-node end-node ${selected ? 'selected' : ''}`}>
    <div className="end-node-inner" />
    <Handle type="target" position={Position.Left} id="l-1" />
    <Handle type="target" position={Position.Left} id="l-2" style={{ top: '50%', visibility: 'hidden' }}/> 
    
    <Handle type="target" position={Position.Top} id="t-1" />
    <Handle type="target" position={Position.Top} id="t-3" style={{ left: '50%', visibility: 'hidden' }} />

    <Handle type="target" position={Position.Right} id="r-1" />
    <Handle type="target" position={Position.Bottom} id="b-1" />
  </div>
));

// --- FORK NODE ---
export const ForkNode = memo(({ selected, data }: NodeProps) => (
  <div className={`special-node fork-node ${selected ? 'selected' : ''}`}>
    <div className="fork-label">{data.label}</div>
    <Handle type="target" position={Position.Top} id="t-1" />
    <Handle type="target" position={Position.Top} id="t-2" style={{ visibility: 'hidden' }} /> 
    
    <Handle type="source" position={Position.Bottom} id="fork-out-1" style={{ left: '25%' }} />
    <Handle type="source" position={Position.Bottom} id="fork-out-2" style={{ left: '75%' }} />
  </div>
));

// --- COMPLETION NODE (Break) ---
export const CompletionNode = memo(({ selected }: NodeProps) => (
  <div className={`special-node completion-node ${selected ? 'selected' : ''}`}>
    <div className="completion-line"></div>
    <Handle type="target" position={Position.Left} id="l-1" />
    <Handle type="target" position={Position.Left} id="l-2" style={{ visibility: 'hidden' }} />
    <Handle type="target" position={Position.Top} id="t-1" />
  </div>
));

// --- PROCESS NODE (Caixa Preta) ---
export const ProcessNode = memo(({ selected }: NodeProps) => (
    <div className={`special-node process-node ${selected ? 'selected' : ''}`}>
    <Handle type="target" position={Position.Top} id="t-1" />
    <Handle type="target" position={Position.Top} id="t-3" style={{ left: '50%', visibility: 'hidden' }} />
    
    <Handle type="target" position={Position.Left} id="l-1" />
    <Handle type="target" position={Position.Left} id="l-2" style={{ top: '50%', visibility: 'hidden' }} />
    
    <Handle type="source" position={Position.Right} id="r-1" />
    <Handle type="source" position={Position.Bottom} id="b-1" />
  </div>
));

// --- EXTERNAL NODE (Meia Lua) ---
export const ExternalNode = memo(({ selected }: NodeProps) => (
  <div className={`special-node external-node ${selected ? 'selected' : ''}`}>
    <div className="external-node-fill" />
    
    <Handle type="target" position={Position.Top} id="t-1" />
    <Handle type="target" position={Position.Left} id="l-1" />
    <Handle type="source" position={Position.Right} id="r-1" />
    <Handle type="source" position={Position.Bottom} id="b-1" />
  </div>
));

export const ContactNode = memo(({ selected, data }: NodeProps) => (
  <div className={`special-node contact-node ${selected ? 'selected' : ''}`}>
    <div className="contact-label">{data.label}</div>
    
    <Handle type="target" position={Position.Top} id="t-1" />
    <Handle type="target" position={Position.Left} id="l-1" />
    <Handle type="source" position={Position.Right} id="r-1" />
    <Handle type="source" position={Position.Bottom} id="b-1" />
  </div>
));