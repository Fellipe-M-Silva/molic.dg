import type { DocumentElement } from '../../types/documentation';
import './DocumentationRenderer.css';
import React, { useState } from 'react';
import { tokenizeMoLIC, getTokenClassName } from '../../core/syntaxHighlighter';
import { Copy, Play } from '@phosphor-icons/react';

interface DocumentationRendererProps {
  elements: DocumentElement[];
  onDiagramPreview?: (code: string) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function DocumentationRenderer({ elements }: DocumentationRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTryCode = (code: string) => {
    // Salvar no localStorage para o editor pegar
    localStorage.setItem('molic-code', code);
    // Disparar evento customizado para o App escutar
    window.dispatchEvent(new CustomEvent('navigateToEditor'));
  };

  function renderElement(element: DocumentElement, index: number): React.ReactNode {
    switch (element.type) {
      case 'heading1':
        return <h1 key={index} id={slugify(element.content || '')} className="doc-h1">{element.content}</h1>;
      
      case 'heading2':
        return <h2 key={index} id={slugify(element.content || '')} className="doc-h2">{element.content}</h2>;
      
      case 'heading3':
        return <h3 key={index} id={slugify(element.content || '')} className="doc-h3">{element.content}</h3>;
      
      case 'heading4':
        return <h4 key={index} id={slugify(element.content || '')} className="doc-h4">{element.content}</h4>;
      
      case 'paragraph':
        return (
          <p key={index} className="doc-paragraph">
            {renderInlineContent(element.content || '')}
          </p>
        );
      
      case 'codeblock':
        {
          const isMoLIC = element.language === 'molic' || element.language === 'diagram' || !element.language;
          const code = element.content || '';
          if (isMoLIC && code) {
            const tokens = tokenizeMoLIC(code);
            return (
              <div key={index} className="doc-codeblock-wrapper">
                <div className="doc-codeblock-header">
                  <span className="doc-codeblock-language">molic</span>
                  <div className="doc-codeblock-actions">
                    <button
                      className="doc-code-btn doc-copy-btn"
                      onClick={() => handleCopyCode(code, index)}
                      title="Copiar código"
                    >
                      <Copy size={16} weight="bold" />
                      {copiedIndex === index ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button
                      className="doc-code-btn doc-try-btn"
                      onClick={() => handleTryCode(code)}
                      title="Experimentar no editor"
                    >
                      <Play size={16} weight="fill" />
                      Experimentar
                    </button>
                  </div>
                </div>
                <pre className={`doc-codeblock language-${element.language || 'molic'}`}>
                  <code>
                    {tokens.map((token, i) => {
                      const className = getTokenClassName(token.type);
                      if (className) {
                        return (
                          <span key={i} className={className}>
                            {token.value}
                          </span>
                        );
                      }
                      return token.value;
                    })}
                  </code>
                </pre>
              </div>
            );
          }
          return (
            <pre key={index} className={`doc-codeblock language-${element.language}`}>
              <code>{element.content}</code>
            </pre>
          );
        }
      
      case 'diagramPreview':
        {
          const tokens = element.content ? tokenizeMoLIC(element.content) : [];
          return (
            <div key={index} className="doc-diagram-preview">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Exemplo de Diagrama MoLIC:
              </p>
              <pre className="doc-diagram-code">
                <code>
                  {tokens.map((token, i) => {
                    const className = getTokenClassName(token.type);
                    if (!className) return token.value;
                    return (
                      <span key={i} className={className}>
                        {token.value}
                      </span>
                    );
                  })}
                </code>
              </pre>
            </div>
          );
        }
      
      case 'list':
        return (
          <ul key={index} className="doc-list">
            {element.children?.map((child, i) => renderElement(child, i)) || []}
          </ul>
        );
      
      case 'listitem':
        return (
          <li key={index} className="doc-listitem">
            {renderInlineContent(element.content || '')}
          </li>
        );
      
      case 'alert':
        return (
          <div key={index} className={`doc-alert alert-${element.alertType}`}>
            <span className="alert-icon">
              {element.alertType === 'info' && 'ℹ️'}
              {element.alertType === 'warning' && '⚠️'}
              {element.alertType === 'success' && '✓'}
              {element.alertType === 'error' && '❌'}
            </span>
            <div className="alert-content">
              {renderInlineContent(element.content || '')}
            </div>
          </div>
        );
      
      default:
        return <div key={index} />;
    }
  }

  function renderInlineContent(text: string): React.ReactNode {
    // Processar em ordem: `code` -> **bold** -> *italic* -> links
    // Processar code primeiro para evitar que regex de bold/italic interfira com conteúdo de código
    let elements: (string | React.ReactElement)[] = [text];

    // `code inline` - processar primeiro
    elements = elements.flatMap((el) => {
      if (typeof el !== 'string') return [el];
      
      const codeRegex = /`([^`]+)`/g;
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = codeRegex.exec(el)) !== null) {
        if (match.index > lastIndex) {
          parts.push(el.slice(lastIndex, match.index));
        }
        parts.push(
          <code key={match.index} className="doc-inline-code">
            {match[1]}
          </code>
        );
        lastIndex = codeRegex.lastIndex;
      }

      if (lastIndex < el.length) {
        parts.push(el.slice(lastIndex));
      }

      return parts.length > 0 ? parts : [el];
    });

    // **bold** ou __bold__
    elements = elements.flatMap((el) => {
      if (typeof el !== 'string') return [el];
      
      const boldRegex = /\*\*(.+?)\*\*|__(.+?)__/g;
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(el)) !== null) {
        if (match.index > lastIndex) {
          parts.push(el.slice(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index}>{match[1] || match[2]}</strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < el.length) {
        parts.push(el.slice(lastIndex));
      }

      return parts.length > 0 ? parts : [el];
    });

    // *italic* ou _italic_
    elements = elements.flatMap((el) => {
      if (typeof el !== 'string') return [el];
      
      const italicRegex = /\*([^*`]+?)\*|_([^_`]+?)_/g;
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = italicRegex.exec(el)) !== null) {
        if (match.index > lastIndex) {
          parts.push(el.slice(lastIndex, match.index));
        }
        parts.push(
          <em key={match.index}>{match[1] || match[2]}</em>
        );
        lastIndex = italicRegex.lastIndex;
      }

      if (lastIndex < el.length) {
        parts.push(el.slice(lastIndex));
      }

      return parts.length > 0 ? parts : [el];
    });

    return elements.length > 0 ? <>{elements}</> : text;
  }

  return (
    <div className="documentation-renderer">
      {elements.map((element, index) => renderElement(element, index))}
    </div>
  );
}
