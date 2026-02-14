import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import './MolicNode.css';

// --- 1. Definição de Estilos (Movemos para fora para não recriar a cada render) ---
const styles = {
  r1: { top: '25%' },
  r2: { top: '50%' },
  r3: { top: '75%' },
  b1: { left: '10%' },
  b2: { left: '30%' },
  b3: { left: '50%' },
  b4: { left: '70%' },
  b5: { left: '90%' },
  t1: { left: '50%' },
  l1: { top: '50%' },
};

// --- 2. Componente Helper (DEFINIDO FORA DO RENDER) ---
const BiDirectionalHandle = ({ id, pos, style }: { id: string, pos: Position, style?: React.CSSProperties }) => (
  <>
    <Handle type="target" position={pos} id={id} style={style} />
    <Handle 
      type="source" 
      position={pos} 
      id={id} 
      style={{ ...style, visibility: 'hidden' }} 
    />
  </>
);

// --- 3. Componente HandleSet ---
const HandleSet = () => {
  return (
    <>
      {/* Right Handles */}
      <BiDirectionalHandle id="r-1" pos={Position.Right} style={styles.r1} />
      <BiDirectionalHandle id="r-2" pos={Position.Right} style={styles.r2} />
      <BiDirectionalHandle id="r-3" pos={Position.Right} style={styles.r3} />
      
      {/* Bottom Handles */}
      <BiDirectionalHandle id="b-1" pos={Position.Bottom} style={styles.b1} />
      <BiDirectionalHandle id="b-2" pos={Position.Bottom} style={styles.b2} />
      <BiDirectionalHandle id="b-3" pos={Position.Bottom} style={styles.b3} />
      <BiDirectionalHandle id="b-4" pos={Position.Bottom} style={styles.b4} />
      <BiDirectionalHandle id="b-5" pos={Position.Bottom} style={styles.b5} />

      {/* Top/Left Padrão */}
      <BiDirectionalHandle id="t-1" pos={Position.Top} style={styles.t1} />
      <BiDirectionalHandle id="l-1" pos={Position.Left} style={styles.l1} />
    </>
  );
};

// --- 4. Nós Especiais ---

export const StartNode = memo(() => (
  <div className="molic-node terminal start">
    <HandleSet />
  </div>
));

export const EndNode = memo(() => (
  <div className="molic-node terminal end">
    <div className="terminal-double-circle">
        <div className="inner" />
    </div>
    <HandleSet />
  </div>
));

export const CompletionNode = memo(() => (
  <div className="molic-node terminal completion">
    <div className="completion-line" />
    <HandleSet />
  </div>
));

export const ForkNode = memo(() => (
  <div className="molic-node fork">
    {/* Fork Handles Específicos */}
    <Handle type="target" position={Position.Top} id="t-1" />
    <Handle type="source" position={Position.Bottom} id="fork-out-1" style={{ left: '25%' }} />
    <Handle type="source" position={Position.Bottom} id="fork-out-2" style={{ left: '75%' }} />
    {/* HandleSet invisível para garantir compatibilidade com IDs extras */}
    <div style={{ opacity: 0, pointerEvents: 'none' }}><HandleSet /></div>
  </div>
));

export const ProcessNode = memo(() => (
  <div className="molic-node process">
    <div className="process-box">
    </div>
    <HandleSet />
  </div>
));

export const ExternalNode = memo(({ data }: NodeProps) => (
  <div className="molic-node external">
    <div className="external-shape">
        <span className="external-label">{data.label}</span>
    </div>
    <HandleSet />
  </div>
));

export const ContactNode = memo(({ data }: NodeProps) => (
  <div className="molic-node contact">
    <div className="contact-icon">user</div> 
    <span className="contact-label">{data.label}</span>
    <HandleSet />
  </div>
));