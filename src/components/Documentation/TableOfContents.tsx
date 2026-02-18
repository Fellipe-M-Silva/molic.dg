import { useEffect, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import type { DocumentElement } from '../../types/documentation';
import { useDocumentationHeadings } from '../../hooks/useDocumentationHeadings';
import './TableOfContents.css';

interface TableOfContentsProps {
  elements: DocumentElement[];
  isInline?: boolean;
  onLinkClick?: () => void;
}

interface HeadingWithChildren {
  id: string;
  text: string;
  level: number;
  children: Array<{ id: string; text: string; level: number }>;
}

export function TableOfContents({ elements, isInline = false, onLinkClick }: TableOfContentsProps) {
  const headings = useDocumentationHeadings(elements);
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || '');
  const [expandedHeading, setExpandedHeading] = useState<string | null>(null);

  // Track active heading
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map((h) => ({ id: h.id, element: document.getElementById(h.id) }))
        .filter((h) => h.element !== null);

      if (headingElements.length === 0) return;

      let active = headingElements[0].id;
      for (const { id, element } of headingElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < 100) {
            active = id;
          }
        }
      }

      setActiveId(active);
    };

    const contentArea = document.querySelector('.docs-content');
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll);
      return () => contentArea.removeEventListener('scroll', handleScroll);
    }
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const contentArea = document.querySelector('.docs-content');
      if (contentArea) {
        // Em mobile, adiciona offset maior para não ficar atrás do botão de menu
        const isMobileView = window.innerWidth <= 768;
        const offsetValue = isMobileView ? 120 : 20;
        const offsetTop = element.offsetTop - offsetValue;
        contentArea.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
    // Chamar callback para fechar o menu se necessário
    if (onLinkClick) {
      onLinkClick();
    }
  };

  if (headings.length === 0) {
    return null;
  }

  // Group headings by level
  const groupedHeadings: HeadingWithChildren[] = [];
  let currentParent: HeadingWithChildren | null = null;

  for (const heading of headings) {
    if (heading.level === 2) {
      currentParent = {
        ...heading,
        children: []
      };
      groupedHeadings.push(currentParent);
    } else if (heading.level > 2 && currentParent) {
      currentParent.children.push(heading);
    }
  }

  if (isInline) {
    return (
      <aside className="table-of-contents inline">
        <h3 className="toc-title">Nesta página</h3>
        <nav className="toc-nav">
          <ul className="toc-list">
            {groupedHeadings.map((heading) => {
              const isParentActive = activeId === heading.id || heading.children.some(child => child.id === activeId);
              
              return (
                <li key={heading.id} className="toc-item toc-level-2">
                  <div className="toc-heading-wrapper">
                    <button
                      className={`toc-link ${isParentActive ? 'active' : ''}`}
                      onClick={() => handleClick(heading.id)}
                    >
                      {heading.text}
                    </button>
                    {heading.children && heading.children.length > 0 && (
                      <button
                        className={`toc-expand-btn ${expandedHeading === heading.id ? 'open' : ''}`}
                        onClick={() => setExpandedHeading(expandedHeading === heading.id ? null : heading.id)}
                      >
                        <CaretDown size={16} weight="bold" />
                      </button>
                    )}
                  </div>
                  {heading.children && heading.children.length > 0 && expandedHeading === heading.id && (
                    <ul className="toc-sublist">
                      {heading.children.map((child) => (
                        <li key={child.id} className="toc-item toc-level-3">
                          <button
                            className={`toc-link ${activeId === child.id ? 'active' : ''}`}
                            onClick={() => handleClick(child.id)}
                          >
                            {child.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="table-of-contents">
      <h3 className="toc-title">Nesta página</h3>
      <nav className="toc-nav">
        <ul className="toc-list">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`toc-item toc-level-${heading.level}`}
            >
              <button
                className={`toc-link ${activeId === heading.id ? 'active' : ''}`}
                onClick={() => handleClick(heading.id)}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
