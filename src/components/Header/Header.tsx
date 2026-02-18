import React, { useState } from 'react';
import { List } from '@phosphor-icons/react';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { ExportButton } from '../ExportButton/ExportButton';
import { SidebarMenu } from './SidebarMenu';
import { type DiagramHandle } from '../Diagram/Diagram';
import './Header.css';

interface LoadMolicProject {
  code: string;
  layout: {
    nodes: unknown[];
    edges: unknown[];
  };
}

interface HeaderProps {
  onDocsClick?: () => void;
  onEditorClick?: () => void;
  diagramRef?: React.RefObject<DiagramHandle | null>;
  code?: string;
  onLoadMolic?: (project: LoadMolicProject) => void;
  showExport?: boolean;
  errorStatus?: 'error' | 'success' | null;
  isDocsPage?: boolean;
}

export function Header({
  onDocsClick,
  onEditorClick,
  diagramRef,
  code,
  onLoadMolic,
  showExport = true,
  errorStatus = null,
  isDocsPage = false
}: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showExport={showExport}
        diagramRef={diagramRef}
        code={code}
        onLoadMolic={onLoadMolic}
      />
      <header className="header">
        <h1 className="header-logo" onClick={() => {
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('navigationchange'));
          }
        }}>
          MoLIC.dg
        </h1>
        
        <nav className="header-nav">
          {onEditorClick && (
            <button 
              className={`header-nav-button ${!isDocsPage ? 'active' : ''}`}
              onClick={onEditorClick}
            >
              Editor
            </button>
          )}
          {onDocsClick && (
            <button 
              className={`header-nav-button ${isDocsPage ? 'active' : ''}`}
              onClick={onDocsClick}
            >
              Docs
            </button>
          )}
        </nav>

        <div className="header-spacer" />

        {errorStatus && (
          <span className={`header-status ${errorStatus}`}>
            {errorStatus === 'error' ? 'Erro de Sintaxe' : 'Compilado'}
          </span>
        )}

        {!isDocsPage && (
          <button
            className="header-menu-btn"
            onClick={() => setSidebarOpen(true)}
            title="Abrir menu de ações"
          >
            <List size={24} weight="bold" />
          </button>
        )}
        
        {showExport && diagramRef && code && onLoadMolic && (
          <ExportButton 
            diagramRef={diagramRef}
            code={code}
            onLoadMolic={onLoadMolic}
          />
        )}

        <ThemeToggle />
      </header>
    </>
  );
}
