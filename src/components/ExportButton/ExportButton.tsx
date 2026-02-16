import React, { useRef, useState } from 'react';
import { DownloadIcon } from '@phosphor-icons/react';
import { exportDiagramAsSVG, exportDiagramAsPNG } from '../../utils/exportSVG';
import './ExportButton.css';

interface ExportButtonProps {
  diagramRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ diagramRef }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExportSVG = async () => {
    setIsExporting(true);
    try {
      if (diagramRef.current) {
        const timestamp = new Date().toISOString().slice(0, 10);
        await exportDiagramAsSVG(diagramRef.current, `diagram-${timestamp}.svg`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erro ao exportar diagrama');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      if (diagramRef.current) {
        const timestamp = new Date().toISOString().slice(0, 10);
        await exportDiagramAsPNG(diagramRef.current, `diagram-${timestamp}.png`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erro ao exportar diagrama');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="export-button-container" ref={menuRef}>
      <button
        className="export-button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        title="Exportar diagrama"
        aria-label="Exportar diagrama"
      >
        <DownloadIcon size={18} weight="regular" />
      </button>

      {showMenu && (
        <div className="export-menu">
          <button
            className="export-option"
            onClick={handleExportSVG}
            disabled={isExporting}
          >
            {isExporting ? 'Exportando...' : 'Exportar como SVG'}
          </button>
          <button
            className="export-option"
            onClick={handleExportPNG}
            disabled={isExporting}
          >
            {isExporting ? 'Exportando...' : 'Exportar como PNG'}
          </button>
        </div>
      )}
    </div>
  );
};
