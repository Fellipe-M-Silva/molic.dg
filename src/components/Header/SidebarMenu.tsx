import { X } from '@phosphor-icons/react';
import { ExportButton } from '../ExportButton/ExportButton';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { type DiagramHandle } from '../Diagram/Diagram';
import './SidebarMenu.css';

interface LoadMolicProject {
  code: string;
  layout: {
    nodes: unknown[];
    edges: unknown[];
  };
}

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  showExport?: boolean;
  diagramRef?: React.RefObject<DiagramHandle | null>;
  code?: string;
  onLoadMolic?: (project: LoadMolicProject) => void;
}

export function SidebarMenu({
  isOpen,
  onClose,
  showExport = true,
  diagramRef,
  code,
  onLoadMolic
}: SidebarMenuProps) {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Ações</h2>
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            title="Fechar menu"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {showExport && diagramRef && code && onLoadMolic && (
            <div className="sidebar-action">
              <ExportButton 
                diagramRef={diagramRef}
                code={code}
                onLoadMolic={onLoadMolic}
              />
            </div>
          )}
          <div className="sidebar-action">
            <ThemeToggle />
          </div>
        </nav>
      </aside>
    </>
  );
}
