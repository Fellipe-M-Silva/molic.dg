import { useState, useRef, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/main.css';
import { Header } from './components/Header/Header';
import { DocsPage } from './components/DocsPage';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { ProblemsPanel } from './components/ProblemsPanel/ProblemsPanel';
import { Diagram, type DiagramHandle } from './components/Diagram/Diagram';
import { useValidation } from './hooks/useValidation';
import { useIsMobile } from './hooks/useIsMobile';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from './context/ToastContext';
import { CaretLeftIcon, CaretRightIcon, CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';

export const INITIAL_CODE = ` // Boas-vindas ao MoLIC.dg :)
 // Crie diagramas MoLIC digitando o código aqui em linguagem .molic.
 // Exemplo (descomente o código para ver o diagrama):
 //start Com {
 //  u: "Entrar" -> HomePage
 //}
 //
 //scene HomePage {
 //  topic: "Página Inicial"
 //  u: "Clicar em 'Comprar'" -> Fim
 //}
 //
 //end Fim
 //
 // Dê uma olhada na documentação para aprender mais sobre a linguagem e como usá-la.
`;

function AppContent() {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState<'editor' | 'docs'>('editor');
  const [code, setCode] = useState(() => {
    return localStorage.getItem('molic-code') || INITIAL_CODE;
  });

  const [editorVisible, setEditorVisible] = useState(() => {
    // Em mobile, editor começa expandido
    return true;
  });
  const [editorWidth, setEditorWidth] = useState(() => {
    const saved = localStorage.getItem('molic-editor-width');
    return saved ? Number(saved) : 360; // Padrão: 360px
  });
  const [editorHeight, setEditorHeight] = useState(() => {
    const saved = localStorage.getItem('molic-editor-height');
    // Em mobile, calcula 50% da altura disponível
    // Em desktop, usa o valor salvo ou padrão de 200px
    if (isMobile) {
      return 400; // ~50% de uma tela mobile típica
    }
    return saved ? Number(saved) : 200;
  });
  const [isResizing, setIsResizing] = useState(false);
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<DiagramHandle | null>(null);

  // Validação com debounce
  const error = useValidation(code, 800);

  // Listener para navegação
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      setCurrentPage(path === '/docs' ? 'docs' : 'editor');
    };

    // Verifica a rota inicial quando o app carrega
    handleNavigation();

    window.addEventListener('navigationchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    
    // Listener para navegação a partir do botão "Experimentar"
    const handleNavigateToEditor = () => {
      // Ler o código atualizado do localStorage
      const updatedCode = localStorage.getItem('molic-code') || INITIAL_CODE;
      setCode(updatedCode);
      window.history.pushState({}, '', '/');
      setCurrentPage('editor');
    };
    window.addEventListener('navigateToEditor', handleNavigateToEditor);
    
    return () => {
      window.removeEventListener('navigationchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('navigateToEditor', handleNavigateToEditor);
    };
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem('molic-code', newCode);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleDoubleClick = () => {
    if (isMobile) {
      setEditorHeight(200);
      localStorage.setItem('molic-editor-height', '200');
    } else {
      setEditorWidth(360); // Reset para padrão
      localStorage.setItem('molic-editor-width', '360');
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !editorPaneRef.current) return;

      const workspace = editorPaneRef.current.parentElement;
      if (!workspace) return;

      const workspaceRect = workspace.getBoundingClientRect();

      if (isMobile) {
        // Resize vertical para mobile
        const newHeight = workspaceRect.bottom - e.clientY;
        const snapPoint = 200;
        const constrained = Math.max(100, Math.min(400, newHeight));

        if (Math.abs(snapPoint - constrained) < 30) {
          setEditorHeight(snapPoint);
          localStorage.setItem('molic-editor-height', '200');
        } else {
          setEditorHeight(constrained);
          localStorage.setItem('molic-editor-height', constrained.toString());
        }
      } else {
        // Resize horizontal para desktop
        const newWidth = e.clientX - workspaceRect.left;
        const snapPoint = 360;
        const constrained = Math.max(200, Math.min(800, newWidth));

        if (Math.abs(snapPoint - constrained) < 30) {
          setEditorWidth(snapPoint);
          localStorage.setItem('molic-editor-width', '360');
        } else {
          setEditorWidth(constrained);
          localStorage.setItem('molic-editor-width', constrained.toString());
        }
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, isMobile]);

  // Keyboard shortcut para toggle editor (E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // Verificar se não está focado em um input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setEditorVisible(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {currentPage === 'docs' ? (
        <DocsPage />
      ) : (
        <>
          <Header
            onEditorClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentPage('editor');
            }}
            onDocsClick={() => {
              window.history.pushState({}, '', '/docs');
              setCurrentPage('docs');
            }}
            diagramRef={diagramRef}
            code={code}
            onLoadMolic={(project) => {
              setCode(project.code);
              localStorage.setItem('molic-code', project.code);
              localStorage.setItem('molic-layout-stable-v4', JSON.stringify({
                nodes: project.layout.nodes,
                edges: project.layout.edges
              }));
            }}
            showExport={true}
            errorStatus={error ? 'error' : 'success'}
            isDocsPage={false}
          />

          <main className={`workspace ${isMobile ? 'mobile' : ''}`}>
            <aside 
              ref={editorPaneRef}
              className={`editor-pane${editorVisible ? '' : ' hidden'}`}
              style={isMobile ? {
                height: editorVisible ? `${editorHeight}px` : '0',
              } : {
                width: editorVisible ? `${editorWidth}px` : '0',
              }}
            >
                <CodeEditor 
                  code={code} 
                  onChange={handleCodeChange}
                  errors={error ? [error] : []}
                />

                {error && <ProblemsPanel errors={[error]} />}

                {/* Handle de Resize */}
                <div
                  className={`resize-handle ${isMobile ? 'horizontal' : 'vertical'}`}
                  onMouseDown={handleMouseDown}
                  onDoubleClick={handleDoubleClick}
                  title={isMobile ? "Arraste para redimensionar | Double-click para reset" : "Arraste para redimensionar | Double-click para reset"}
                />

              {/* Botão de Ocultar */}
              <button
                className={`editor-toggle-btn hide ${isMobile ? 'mobile' : ''}`}
                onClick={() => setEditorVisible(false)}
                title={isMobile ? "Ocultar editor" : "Ocultar editor (E)"}
              >
                {isMobile ? <CaretDownIcon size={16} weight="bold" /> : <CaretLeftIcon size={16} weight="bold" />}
              </button>
            </aside>

            {/* Botão de Mostrar (flutuante) */}
            {!editorVisible && (
              <button
                className={`editor-toggle-btn show ${isMobile ? 'mobile' : ''}`}
                onClick={() => setEditorVisible(true)}
                title={isMobile ? "Mostrar editor" : "Mostrar editor (E)"}
              >
                {isMobile ? <CaretUpIcon size={16} weight="bold" /> : <CaretRightIcon size={16} weight="bold" />}
              </button>
            )}

            <div className="diagram-pane">
              <Diagram code={code} ref={diagramRef} />
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default function App() {
	return (
		<ThemeProvider>
			<ReactFlowProvider>
				<ToastProvider>
					<AppContent />
				</ToastProvider>
			</ReactFlowProvider>
		</ThemeProvider>
	);
}