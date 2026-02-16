import React, { useRef, useState, useEffect } from 'react';
import {
	DownloadIcon,
	PrinterIcon,
	FloppyDiskIcon,
	CaretDown,
	UploadIcon,
	File,
	FileSvg,
	FilePng,
	FilePdf,
} from '@phosphor-icons/react';
import {
	exportDiagramAsSVG,
	exportDiagramAsPNG,
	exportDiagramAsPDF,
	saveMolicProject,
	printDiagram,
	loadMolicProject,
} from '../../utils/exportSVG';
import { useToastContext } from '../../hooks/useToast';
import './ExportButton.css';

interface ExportButtonProps {
	diagramRef: React.RefObject<HTMLDivElement | null>;
	code?: string;
	nodes?: { id: string; position: { x: number; y: number } }[];
	edges?: { id: string; sourceHandle?: string | null; targetHandle?: string | null }[];
	onLoadMolic?: (project: { code: string; layout: { nodes: { id: string; position: { x: number; y: number } }[]; edges: { id: string; sourceHandle?: string | null; targetHandle?: string | null }[] } }) => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ diagramRef, code = '', nodes = [], edges = [], onLoadMolic }) => {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { loading, success, error, removeToast } = useToastContext();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Fecha o menu ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			// Usa capture: true para garantir que pegue eventos mesmo se bloqueados pelo ReactFlow
			document.addEventListener('mousedown', handleClickOutside, true);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside, true);
			};
		}
	}, [showMenu]);

	// Helper para extrair o elemento HTML real
	const getDiagramElement = (): HTMLElement | null => {
		if (!diagramRef.current) return null;
		// Se for um HTMLElement válido, retorna direto
		if (diagramRef.current instanceof HTMLElement) {
			return diagramRef.current;
		}
		// Se for um objeto com properties de HTMLElement, retorna como é
		return diagramRef.current as unknown as HTMLElement;
	};

	// Helper para fazer zoom to fit antes de exportar
	const fitViewBeforeExport = async (): Promise<void> => {
		if (diagramRef.current && typeof (diagramRef.current as any).fitViewBeforeExport === 'function') {
			(diagramRef.current as any).fitViewBeforeExport();
			// Aguardar o zoom terminar (200ms é a duração do fit view)
			await new Promise(resolve => setTimeout(resolve, 250));
		}
	};

	const handleExportSVG = async () => {
		const toastId = loading('Exportando como SVG...');
		try {
			await fitViewBeforeExport();
			const element = getDiagramElement();
			if (element) {
				const timestamp = new Date().toISOString().slice(0, 10);
				await exportDiagramAsSVG(element, `diagram-${timestamp}.svg`);
				removeToast(toastId);
				success('SVG exportado com sucesso!');
			}
		} catch (err) {
			console.error('Export failed:', err);
			removeToast(toastId);
			error('Erro ao exportar diagrama como SVG');
		} finally {
			setShowMenu(false);
		}
	};

	const handleExportPNG = async () => {
		const toastId = loading('Exportando como PNG (transparente)...');
		try {
			await fitViewBeforeExport();
			const element = getDiagramElement();
			if (element) {
				const timestamp = new Date().toISOString().slice(0, 10);
				await exportDiagramAsPNG(element, `diagram-${timestamp}.png`, {
					backgroundColor: 'transparent',
				});
				removeToast(toastId);
				success('PNG transparente exportado com sucesso!');
			}
		} catch (err) {
			console.error('Export failed:', err);
			removeToast(toastId);
			error('Erro ao exportar diagrama como PNG');
		} finally {
			setShowMenu(false);
		}
	};

	const handleExportPNGWhite = async () => {
		const toastId = loading('Exportando como PNG (branco)...');
		try {
			await fitViewBeforeExport();
			const element = getDiagramElement();
			if (element) {
				const timestamp = new Date().toISOString().slice(0, 10);
				await exportDiagramAsPNG(element, `diagram-${timestamp}.png`, {
					backgroundColor: 'white',
				});
				removeToast(toastId);
				success('PNG branco exportado com sucesso!');
			}
		} catch (err) {
			console.error('Export failed:', err);
			removeToast(toastId);
			error('Erro ao exportar diagrama como PNG');
		} finally {
			setShowMenu(false);
		}
	};

	const handleExportPDF = async () => {
		const toastId = loading('Exportando como PDF...');
		try {
			await fitViewBeforeExport();
			const element = getDiagramElement();
			if (element) {
				const timestamp = new Date().toISOString().slice(0, 10);
				await exportDiagramAsPDF(element, `diagram-${timestamp}.pdf`, {
					backgroundColor: 'white',
				});
				removeToast(toastId);
				success('PDF exportado com sucesso!');
			}
		} catch (err) {
			console.error('Export failed:', err);
			removeToast(toastId);
			error('Erro ao exportar diagrama como PDF');
		} finally {
			setShowMenu(false);
		}
	};

	const handlePrint = async () => {
		const toastId = loading('Preparando impressão...');
		try {
			await fitViewBeforeExport();
			const element = getDiagramElement();
			if (element) {
				await printDiagram(element);
				removeToast(toastId);
				success('Impressão aberta com sucesso!');
			}
		} catch (err) {
			console.error('Print failed:', err);
			removeToast(toastId);
			error('Erro ao preparar impressão');
		} finally {
			setShowMenu(false);
		}
	};

	const handleSave = () => {
		const toastId = loading('Salvando diagrama como .molic...');
		try {
			const nodesAndEdges = (diagramRef.current as any)?.getNodesAndEdges?.();
			const timestamp = new Date().toISOString().slice(0, 10);
			saveMolicProject(
				code,
				nodesAndEdges?.nodes || nodes,
				nodesAndEdges?.edges || edges,
				`diagram-${timestamp}.molic`
			);
			removeToast(toastId);
			success('Diagrama salvo com sucesso!');
		} catch (err) {
			console.error('Save failed:', err);
			removeToast(toastId);
			error('Erro ao salvar diagrama');
		}
	};

	const handleLoadMolic = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.molic')) {
			error('Por favor, selecione um arquivo .molic válido');
			return;
		}

		const toastId = loading('Carregando diagrama...');
		try {
			const project = await loadMolicProject(file);
			if (onLoadMolic) {
				onLoadMolic(project);
			}
			removeToast(toastId);
			success('Diagrama carregado com sucesso!');
		} catch (err) {
			console.error('Load failed:', err);
			removeToast(toastId);
			error('Erro ao carregar diagrama');
		}
		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className="export-button-container" ref={menuRef}>
			<div className="button-group">
				<button
					className="export-button"
					onClick={handleLoadMolic}
					title="Carregar diagrama (.molic)"
					aria-label="Carregar diagrama"
				>
					<UploadIcon size={18} weight="regular" />
					<span>Importar</span>
				</button>
				<button
					className={`export-button export-dropdown ${showMenu ? 'active' : ''}`}
					onClick={() => setShowMenu(!showMenu)}
					title="Exportar diagrama"
					aria-label="Exportar diagrama"
					aria-expanded={showMenu}
				>
					<DownloadIcon size={18} weight="regular" />
					<span>Exportar</span>
					<CaretDown size={14} weight="bold" />
				</button>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".molic"
				style={{ display: 'none' }}
				onChange={handleFileSelect}
				aria-label="Selecionar arquivo .molic"
			/>

			{showMenu && (
        <div className="export-menu">
          <button
						className="export-option"
						onClick={handleSave}
					>
						<File size={16} weight="regular" />
						.molic
					</button>
					
          <hr className="export-menu-divider"></hr>
					<button
						className="export-option"
						onClick={handleExportSVG}
					>
						<FileSvg size={16} weight="regular" />
						.svg
          </button>
          <button
						className="export-option"
						onClick={handleExportPNGWhite}
					>
						<FilePng size={16} weight="regular" />
						.png (fundo branco)
					</button>
					<button
						className="export-option"
						onClick={handleExportPNG}
					>
						<FilePng size={16} weight="regular" />
						.png (fundo transparente)
					</button>		
					<button
						className="export-option"
						onClick={handleExportPDF}
					>
						<FilePdf size={16} weight="regular" />
						.pdf
          </button>
          <hr className="export-menu-divider"></hr>
          <button
						className="export-option"
						onClick={handlePrint}
					>
						<PrinterIcon size={16} weight="regular" />
						Imprimir
          </button>
					<div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
					
				</div>
			)}
		</div>
	);
};
