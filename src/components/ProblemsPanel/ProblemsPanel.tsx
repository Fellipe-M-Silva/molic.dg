import React from 'react';
import type { ParsingError } from '../../core/parser';

interface ProblemsPanelProps {
  errors: ParsingError[];
  onErrorClick?: (error: ParsingError) => void;
}

export const ProblemsPanel: React.FC<ProblemsPanelProps> = ({ errors, onErrorClick }) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--border-base)',
        maxHeight: '200px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-muted)',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: 'var(--text-base)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ color: '#ff4d4f' }}>●</span>
        <span>Problemas</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ({errors.length} {errors.length === 1 ? 'erro' : 'erros'})
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {errors.map((error, index) => (
          <div
            key={index}
            onClick={() => onErrorClick?.(error)}
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-muted)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                flexShrink: 0,
                color: '#ff4d4f',
                fontWeight: 'bold',
                fontSize: '0.75rem',
              }}
            >
              [{error.line}:{error.column}]
            </div>
            <div
              style={{
                flex: 1,
                color: 'var(--text-base)',
                wordBreak: 'break-word',
              }}
            >
              {error.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
