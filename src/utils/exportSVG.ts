import { toSvg, toPng } from "html-to-image";
import jsPDF from "jspdf";
import type { Edge, Node as RFNode } from "reactflow";

export const exportDiagramAsSVG = async (
	diagramElement: HTMLElement | null,
	filename: string = "diagram.svg",
) => {
	if (!diagramElement) {
		console.error("Diagram element not found");
		return;
	}

	try {
		// Store original styles to restore later
		const elementsToHide: { element: Element; display: string }[] = [];
		const originalStyles: { element: Element; style: string }[] = [];

		// Hide toolbar, controls, and background
		const toolbar = diagramElement.querySelector('[data-toolbar="true"]');
		const controls = diagramElement.querySelector(".react-flow__controls");
		const background = diagramElement.querySelector(
			".react-flow__background",
		);
		const attribution = diagramElement.querySelector(
			".react-flow__attribution",
		);

		if (toolbar) {
			const el = toolbar as HTMLElement;
			elementsToHide.push({
				element: toolbar,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (controls) {
			const el = controls as HTMLElement;
			elementsToHide.push({
				element: controls,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (background) {
			const el = background as HTMLElement;
			elementsToHide.push({
				element: background,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (attribution) {
			const el = attribution as HTMLElement;
			elementsToHide.push({
				element: attribution,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		// Make SVG markers visible temporarily
		const markerSvg = diagramElement.querySelector(
			'svg[style*="width: 0"]',
		) as HTMLElement;
		if (markerSvg) {
			originalStyles.push({
				element: markerSvg,
				style: markerSvg.getAttribute("style") || "",
			});
			markerSvg.style.position = "absolute";
			markerSvg.style.width = "200px";
			markerSvg.style.height = "200px";
			markerSvg.style.pointerEvents = "none";
		}

		// Ensure edge paths have visible stroke
		const edgePaths = diagramElement.querySelectorAll(
			".react-flow__edge-path",
		);
		edgePaths.forEach((path) => {
			const el = path as SVGPathElement;
			originalStyles.push({
				element: el,
				style: el.getAttribute("style") || "",
			});
			if (!el.style.stroke) {
				el.style.stroke = "var(--text-base)";
			}
			if (!el.style.strokeWidth) {
				el.style.strokeWidth = "2px";
			}
		});

		// Remove background colors (var(--bg-alt) or var(--bg-canvas))
		const allElements = diagramElement.querySelectorAll("*");
		allElements.forEach((el) => {
			const element = el as HTMLElement;
			const bgColor = window.getComputedStyle(element).backgroundColor;
			if (
				bgColor &&
				(bgColor.includes("128, 128, 128") ||
					bgColor.includes("rgb(128") ||
					bgColor.match(/rgb\(\s*12[0-9],\s*12[0-9],\s*12[0-9]\)/))
			) {
				originalStyles.push({
					element: el,
					style: el.getAttribute("style") || "",
				});
				element.style.backgroundColor = "rgba(255, 255, 255, 0)";
			}
		});

		// Remove problematic stylesheets from DOM temporarily
		const removedLinks: { element: HTMLElement; parent: Node }[] = [];

		// Remove link tags with problematic CDNs
		const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
		linkTags.forEach((link) => {
			const href = link.getAttribute("href") || "";
			if (
				href.includes("fonts.googleapis") ||
				href.includes("cdn.jsdelivr.net") ||
				href.includes("monaco-editor")
			) {
				const parent = link.parentNode;
				if (parent) {
					parent.removeChild(link);
					removedLinks.push({ element: link as HTMLElement, parent });
				}
			}
		});

		// Export to SVG
		const svgDataUrl = await toSvg(diagramElement, {
			cacheBust: true,
			pixelRatio: 2,
			backgroundColor: "rgba(255, 255, 255, 0)",
		});

		// Restore removed links
		removedLinks.forEach(({ element, parent }) => {
			parent.appendChild(element);
		});

		// Restore hidden elements
		elementsToHide.forEach(({ element, display }) => {
			(element as HTMLElement).style.display = display;
		});

		// Restore original styles
		originalStyles.forEach(({ element, style }) => {
			if (style) {
				element.setAttribute("style", style);
			} else {
				element.removeAttribute("style");
			}
		});

		// Create a link element and trigger download
		const link = document.createElement("a");
		link.href = svgDataUrl;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error("Error exporting diagram as SVG:", error);
		throw error;
	}
};

// Helper function to calculate bounds of visible content
const calculateContentBounds = (diagramElement: HTMLElement): DOMRect => {
	const nodeElements = diagramElement.querySelectorAll(".react-flow__node");
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	nodeElements.forEach((node) => {
		const rect = (node as HTMLElement).getBoundingClientRect();
		const diagramRect = diagramElement.getBoundingClientRect();

		const relativeX = rect.left - diagramRect.left;
		const relativeY = rect.top - diagramRect.top;

		minX = Math.min(minX, relativeX);
		minY = Math.min(minY, relativeY);
		maxX = Math.max(maxX, relativeX + rect.width);
		maxY = Math.max(maxY, relativeY + rect.height);
	});

	// If no nodes found, return full diagram bounds
	if (minX === Infinity) {
		return diagramElement.getBoundingClientRect();
	}

	// Create a pseudo DOMRect object with the calculated bounds
	return new DOMRectReadOnly(minX, minY, maxX - minX, maxY - minY);
};

export const exportDiagramAsPNG = async (
	diagramElement: HTMLElement | null,
	filename: string = "diagram.png",
	options: {
		margin?: number;
		backgroundColor?: "white" | "transparent";
	} = {},
) => {
	const { margin = 20, backgroundColor = "transparent" } = options;
	if (!diagramElement) {
		console.error("Diagram element not found");
		return;
	}

	try {
		// Store original styles to restore later
		const elementsToHide: { element: Element; display: string }[] = [];
		const originalStyles: { element: Element; style: string }[] = [];

		// Hide toolbar, controls, and background
		const toolbar = diagramElement.querySelector('[data-toolbar="true"]');
		const controls = diagramElement.querySelector(".react-flow__controls");
		const background = diagramElement.querySelector(
			".react-flow__background",
		);
		const attribution = diagramElement.querySelector(
			".react-flow__attribution",
		);

		if (toolbar) {
			const el = toolbar as HTMLElement;
			elementsToHide.push({
				element: toolbar,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (controls) {
			const el = controls as HTMLElement;
			elementsToHide.push({
				element: controls,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (background) {
			const el = background as HTMLElement;
			elementsToHide.push({
				element: background,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (attribution) {
			const el = attribution as HTMLElement;
			elementsToHide.push({
				element: attribution,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		// Make SVG markers visible temporarily
		const markerSvg = diagramElement.querySelector(
			'svg[style*="width: 0"]',
		) as HTMLElement;
		if (markerSvg) {
			originalStyles.push({
				element: markerSvg,
				style: markerSvg.getAttribute("style") || "",
			});
			markerSvg.style.position = "absolute";
			markerSvg.style.width = "200px";
			markerSvg.style.height = "200px";
			markerSvg.style.pointerEvents = "none";
		}

		// Ensure edge paths have visible stroke
		const edgePaths = diagramElement.querySelectorAll(
			".react-flow__edge-path",
		);
		edgePaths.forEach((path) => {
			const el = path as SVGPathElement;
			originalStyles.push({
				element: el,
				style: el.getAttribute("style") || "",
			});
			if (!el.style.stroke) {
				el.style.stroke = "var(--text-base)";
			}
			if (!el.style.strokeWidth) {
				el.style.strokeWidth = "2px";
			}
		});

		// Remove background colors (var(--bg-alt) or var(--bg-canvas))
		const allElements = diagramElement.querySelectorAll("*");
		allElements.forEach((el) => {
			const element = el as HTMLElement;
			const bgColor = window.getComputedStyle(element).backgroundColor;
			if (
				bgColor &&
				(bgColor.includes("128, 128, 128") ||
					bgColor.includes("rgb(128") ||
					bgColor.match(/rgb\(\s*12[0-9],\s*12[0-9],\s*12[0-9]\)/))
			) {
				originalStyles.push({
					element: el,
					style: el.getAttribute("style") || "",
				});
				element.style.backgroundColor = "rgba(255, 255, 255, 0)";
			}
		});

		// Remove problematic stylesheets from DOM temporarily
		const removedLinks: { element: HTMLElement; parent: Node }[] = [];

		// Remove link tags with problematic CDNs
		const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
		linkTags.forEach((link) => {
			const href = link.getAttribute("href") || "";
			if (
				href.includes("fonts.googleapis") ||
				href.includes("cdn.jsdelivr.net") ||
				href.includes("monaco-editor")
			) {
				const parent = link.parentNode;
				if (parent) {
					parent.removeChild(link);
					removedLinks.push({ element: link as HTMLElement, parent });
				}
			}
		});

		// Calculate content bounds with margin
		const contentBounds = calculateContentBounds(diagramElement);
		const pixelRatio = 6; // 2x size at ~600 DPI quality
		const cropWidth = (contentBounds.width + margin * 2) * pixelRatio;
		const cropHeight = (contentBounds.height + margin * 2) * pixelRatio;
		const cropX = (contentBounds.left - margin) * pixelRatio;
		const cropY = (contentBounds.top - margin) * pixelRatio;

		// Determine background color
		const bgColor =
			backgroundColor === "white"
				? "rgba(255, 255, 255, 1)"
				: "rgba(255, 255, 255, 0)";

		// Export full diagram as PNG first
		const fullPngDataUrl = await toPng(diagramElement, {
			cacheBust: true,
			pixelRatio: pixelRatio,
			backgroundColor: bgColor,
		});

		// Restore removed links
		removedLinks.forEach(({ element, parent }) => {
			parent.appendChild(element);
		});

		// Restore hidden elements
		elementsToHide.forEach(({ element, display }) => {
			(element as HTMLElement).style.display = display;
		});

		// Restore original styles
		originalStyles.forEach(({ element, style }) => {
			if (style) {
				element.setAttribute("style", style);
			} else {
				element.removeAttribute("style");
			}
		});

		// Create image from data URL and crop using canvas
		const image = new Image();
		image.onload = () => {
			const croppedCanvas = document.createElement("canvas");
			croppedCanvas.width = Math.ceil(cropWidth);
			croppedCanvas.height = Math.ceil(cropHeight);

			const ctx = croppedCanvas.getContext("2d");
			if (!ctx) {
				console.error("Failed to get canvas context");
				return;
			}

			// Fill with white background if needed
			if (backgroundColor === "white") {
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);
			}

			ctx.drawImage(
				image,
				Math.max(0, Math.floor(cropX)),
				Math.max(0, Math.floor(cropY)),
				Math.ceil(cropWidth),
				Math.ceil(cropHeight),
				0,
				0,
				Math.ceil(cropWidth),
				Math.ceil(cropHeight),
			);

			const croppedPngDataUrl = croppedCanvas.toDataURL("image/png");

			// Create a link element and trigger download
			const link = document.createElement("a");
			link.href = croppedPngDataUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
		image.onerror = () => {
			console.error("Failed to load image for cropping");
		};
		image.src = fullPngDataUrl;
	} catch (error) {
		console.error("Error exporting diagram as PNG:", error);
		throw error;
	}
};

export const exportDiagramAsPDF = async (
	diagramElement: HTMLElement | null,
	filename: string = "diagram.pdf",
	options: {
		margin?: number;
		backgroundColor?: "white" | "transparent";
	} = {},
) => {
	const { margin = 20, backgroundColor = "white" } = options;
	if (!diagramElement) {
		console.error("Diagram element not found");
		return;
	}

	try {
		// Store original styles to restore later
		const elementsToHide: { element: Element; display: string }[] = [];
		const originalStyles: { element: Element; style: string }[] = [];

		// Hide toolbar, controls, and background
		const toolbar = diagramElement.querySelector('[data-toolbar="true"]');
		const controls = diagramElement.querySelector(".react-flow__controls");
		const background = diagramElement.querySelector(
			".react-flow__background",
		);
		const attribution = diagramElement.querySelector(
			".react-flow__attribution",
		);

		if (toolbar) {
			const el = toolbar as HTMLElement;
			elementsToHide.push({
				element: toolbar,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (controls) {
			const el = controls as HTMLElement;
			elementsToHide.push({
				element: controls,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (background) {
			const el = background as HTMLElement;
			elementsToHide.push({
				element: background,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (attribution) {
			const el = attribution as HTMLElement;
			elementsToHide.push({
				element: attribution,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		// Make SVG markers visible temporarily
		const markerSvg = diagramElement.querySelector(
			'svg[style*="width: 0"]',
		) as HTMLElement;
		if (markerSvg) {
			originalStyles.push({
				element: markerSvg,
				style: markerSvg.getAttribute("style") || "",
			});
			markerSvg.style.position = "absolute";
			markerSvg.style.width = "200px";
			markerSvg.style.height = "200px";
			markerSvg.style.pointerEvents = "none";
		}

		// Ensure edge paths have visible stroke
		const edgePaths = diagramElement.querySelectorAll(
			".react-flow__edge-path",
		);
		edgePaths.forEach((path) => {
			const el = path as SVGPathElement;
			originalStyles.push({
				element: el,
				style: el.getAttribute("style") || "",
			});
			if (!el.style.stroke) {
				el.style.stroke = "var(--text-base)";
			}
			if (!el.style.strokeWidth) {
				el.style.strokeWidth = "2px";
			}
		});

		// Remove background colors (var(--bg-alt) or var(--bg-canvas))
		const allElements = diagramElement.querySelectorAll("*");
		allElements.forEach((el) => {
			const element = el as HTMLElement;
			const bgColor = window.getComputedStyle(element).backgroundColor;
			if (
				bgColor &&
				(bgColor.includes("128, 128, 128") ||
					bgColor.includes("rgb(128") ||
					bgColor.match(/rgb\(\s*12[0-9],\s*12[0-9],\s*12[0-9]\)/))
			) {
				originalStyles.push({
					element: el,
					style: el.getAttribute("style") || "",
				});
				element.style.backgroundColor = "rgba(255, 255, 255, 0)";
			}
		});

		// Remove problematic stylesheets from DOM temporarily
		const removedLinks: { element: HTMLElement; parent: Node }[] = [];

		// Remove link tags with problematic CDNs
		const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
		linkTags.forEach((link) => {
			const href = link.getAttribute("href") || "";
			if (
				href.includes("fonts.googleapis") ||
				href.includes("cdn.jsdelivr.net") ||
				href.includes("monaco-editor")
			) {
				const parent = link.parentNode;
				if (parent) {
					parent.removeChild(link);
					removedLinks.push({ element: link as HTMLElement, parent });
				}
			}
		});

		// Calculate content bounds with margin
		const contentBounds = calculateContentBounds(diagramElement);
		const pixelRatio = 6; // ~600 DPI for high-quality PDF
		const cropWidth = (contentBounds.width + margin * 2) * pixelRatio;
		const cropHeight = (contentBounds.height + margin * 2) * pixelRatio;
		const cropX = (contentBounds.left - margin) * pixelRatio;
		const cropY = (contentBounds.top - margin) * pixelRatio;

		// Determine background color
		const bgColor =
			backgroundColor === "white"
				? "rgba(255, 255, 255, 1)"
				: "rgba(255, 255, 255, 0)";

		// Export full diagram as PNG first
		const fullPngDataUrl = await toPng(diagramElement, {
			cacheBust: true,
			pixelRatio: pixelRatio,
			backgroundColor: bgColor,
		});

		// Restore removed links
		removedLinks.forEach(({ element, parent }) => {
			parent.appendChild(element);
		});

		// Restore hidden elements
		elementsToHide.forEach(({ element, display }) => {
			(element as HTMLElement).style.display = display;
		});

		// Restore original styles
		originalStyles.forEach(({ element, style }) => {
			if (style) {
				element.setAttribute("style", style);
			} else {
				element.removeAttribute("style");
			}
		});

		// Create image from data URL and crop using canvas
		const image = new Image();
		image.onload = () => {
			const croppedCanvas = document.createElement("canvas");
			croppedCanvas.width = Math.ceil(cropWidth);
			croppedCanvas.height = Math.ceil(cropHeight);

			const ctx = croppedCanvas.getContext("2d");
			if (!ctx) {
				console.error("Failed to get canvas context");
				return;
			}

			// Fill with white background if needed
			if (backgroundColor === "white") {
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);
			}

			ctx.drawImage(
				image,
				Math.max(0, Math.floor(cropX)),
				Math.max(0, Math.floor(cropY)),
				Math.ceil(cropWidth),
				Math.ceil(cropHeight),
				0,
				0,
				Math.ceil(cropWidth),
				Math.ceil(cropHeight),
			);

			const croppedPngDataUrl = croppedCanvas.toDataURL("image/png");

			// Convert cropped PNG to PDF with proper sizing
			const pdfWidth = Math.ceil(contentBounds.width + margin * 2); // in mm
			const pdfHeight = Math.ceil(contentBounds.height + margin * 2); // in mm

			const pdf = new jsPDF({
				orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
				unit: "mm",
				format: [pdfWidth, pdfHeight],
			});

			// Add the cropped image at full width and height to fill the PDF
			pdf.addImage(croppedPngDataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
			pdf.save(filename);
		};
		image.onerror = () => {
			console.error("Failed to load image for PDF export");
		};
		image.src = fullPngDataUrl;
	} catch (error) {
		console.error("Error exporting diagram as PDF:", error);
		throw error;
	}
};

export const saveDiagramLayout = (diagramData: unknown) => {
	try {
		const filename = `diagram-${new Date().toISOString().slice(0, 10)}.json`;
		const dataStr = JSON.stringify(diagramData, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Error saving diagram layout:", error);
		throw error;
	}
};

export interface MolicProject {
	version: "1.0";
	timestamp: string;
	code: string;
	layout: {
		nodes: Array<{ id: string; position: { x: number; y: number } }>;
		edges: Array<{
			id: string;
			sourceHandle?: string | null;
			targetHandle?: string | null;
		}>;
	};
}

export const saveMolicProject = (
	code: string,
	nodes: RFNode[],
	edges: Edge[],
	filename?: string,
) => {
	try {
		const project: MolicProject = {
			version: "1.0",
			timestamp: new Date().toISOString(),
			code,
			layout: {
				nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
				edges: edges.map((e) => ({
					id: e.id,
					sourceHandle: e.sourceHandle || null,
					targetHandle: e.targetHandle || null,
				})),
			},
		};

		const timestamp = new Date().toISOString().slice(0, 10);
		const finalFilename = filename || `diagram-${timestamp}.molic`;
		const dataStr = JSON.stringify(project, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = finalFilename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Error saving MoLIC project:", error);
		throw error;
	}
};

export const loadMolicProject = (file: File): Promise<MolicProject> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const project = JSON.parse(content) as MolicProject;
				resolve(project);
			} catch (error) {
				reject(
					new Error(
						"Erro ao analysar arquivo .molic: " +
							(error instanceof Error ? error.message : ""),
					),
				);
			}
		};
		reader.onerror = () => {
			reject(new Error("Erro ao ler arquivo"));
		};
		reader.readAsText(file);
	});
};

export const printDiagram = async (diagramElement: HTMLElement | null) => {
	const margin = 20;
	if (!diagramElement) {
		console.error("Diagram element not found");
		return;
	}

	try {
		// Store original styles to restore later
		const elementsToHide: { element: Element; display: string }[] = [];
		const originalStyles: { element: Element; style: string }[] = [];

		// Hide toolbar, controls, and background
		const toolbar = diagramElement.querySelector('[data-toolbar="true"]');
		const controls = diagramElement.querySelector(".react-flow__controls");
		const background = diagramElement.querySelector(
			".react-flow__background",
		);
		const attribution = diagramElement.querySelector(
			".react-flow__attribution",
		);

		if (toolbar) {
			const el = toolbar as HTMLElement;
			elementsToHide.push({
				element: toolbar,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (controls) {
			const el = controls as HTMLElement;
			elementsToHide.push({
				element: controls,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (background) {
			const el = background as HTMLElement;
			elementsToHide.push({
				element: background,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		if (attribution) {
			const el = attribution as HTMLElement;
			elementsToHide.push({
				element: attribution,
				display: el.style.display,
			});
			el.style.display = "none";
		}

		// Make SVG markers visible temporarily
		const markerSvg = diagramElement.querySelector(
			'svg[style*="width: 0"]',
		) as HTMLElement;
		if (markerSvg) {
			originalStyles.push({
				element: markerSvg,
				style: markerSvg.getAttribute("style") || "",
			});
			markerSvg.style.position = "absolute";
			markerSvg.style.width = "200px";
			markerSvg.style.height = "200px";
			markerSvg.style.pointerEvents = "none";
		}

		// Ensure edge paths have visible stroke
		const edgePaths = diagramElement.querySelectorAll(
			".react-flow__edge-path",
		);
		edgePaths.forEach((path) => {
			const el = path as SVGPathElement;
			originalStyles.push({
				element: el,
				style: el.getAttribute("style") || "",
			});
			if (!el.style.stroke) {
				el.style.stroke = "var(--text-base)";
			}
			if (!el.style.strokeWidth) {
				el.style.strokeWidth = "2px";
			}
		});

		// Remove background colors (var(--bg-alt) or var(--bg-canvas))
		const allElements = diagramElement.querySelectorAll("*");
		allElements.forEach((el) => {
			const element = el as HTMLElement;
			const bgColor = window.getComputedStyle(element).backgroundColor;
			if (
				bgColor &&
				(bgColor.includes("128, 128, 128") ||
					bgColor.includes("rgb(128") ||
					bgColor.match(/rgb\(\s*12[0-9],\s*12[0-9],\s*12[0-9]\)/))
			) {
				originalStyles.push({
					element: el,
					style: el.getAttribute("style") || "",
				});
				element.style.backgroundColor = "rgba(255, 255, 255, 0)";
			}
		});

		// Remove problematic stylesheets from DOM temporarily
		const removedLinks: { element: HTMLElement; parent: Node }[] = [];

		// Remove link tags with problematic CDNs
		const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
		linkTags.forEach((link) => {
			const href = link.getAttribute("href") || "";
			if (
				href.includes("fonts.googleapis") ||
				href.includes("cdn.jsdelivr.net") ||
				href.includes("monaco-editor")
			) {
				const parent = link.parentNode;
				if (parent) {
					parent.removeChild(link);
					removedLinks.push({ element: link as HTMLElement, parent });
				}
			}
		});

		// Calculate content bounds with margin
		const contentBounds = calculateContentBounds(diagramElement);
		const pixelRatio = 6; // ~600 DPI for high-quality print
		const cropWidth = (contentBounds.width + margin * 2) * pixelRatio;
		const cropHeight = (contentBounds.height + margin * 2) * pixelRatio;
		const cropX = (contentBounds.left - margin) * pixelRatio;
		const cropY = (contentBounds.top - margin) * pixelRatio;

		// Export full diagram as PNG first
		const fullPngDataUrl = await toPng(diagramElement, {
			cacheBust: true,
			pixelRatio: pixelRatio,
			backgroundColor: "rgba(255, 255, 255, 1)",
		});

		// Restore removed links
		removedLinks.forEach(({ element, parent }) => {
			parent.appendChild(element);
		});

		// Restore hidden elements
		elementsToHide.forEach(({ element, display }) => {
			(element as HTMLElement).style.display = display;
		});

		// Restore original styles
		originalStyles.forEach(({ element, style }) => {
			if (style) {
				element.setAttribute("style", style);
			} else {
				element.removeAttribute("style");
			}
		});

		// Create image from data URL and crop using canvas
		const image = new Image();
		image.onload = () => {
			const croppedCanvas = document.createElement("canvas");
			croppedCanvas.width = Math.ceil(cropWidth);
			croppedCanvas.height = Math.ceil(cropHeight);

			const ctx = croppedCanvas.getContext("2d");
			if (!ctx) {
				console.error("Failed to get canvas context");
				return;
			}

			// Fill with white background
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);

			ctx.drawImage(
				image,
				Math.max(0, Math.floor(cropX)),
				Math.max(0, Math.floor(cropY)),
				Math.ceil(cropWidth),
				Math.ceil(cropHeight),
				0,
				0,
				Math.ceil(cropWidth),
				Math.ceil(cropHeight),
			);

			const croppedPngDataUrl = croppedCanvas.toDataURL("image/png");

			// Create print window with cropped image
			const printWindow = window.open("", "_blank");
			if (!printWindow) {
				console.error("Failed to open print window");
				return;
			}

			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Print Diagram</title>
					<style>
						body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: white; }
						img { max-width: 100%; height: auto; display: block; }
						@media print {
							body { margin: 0; padding: 0; }
							img { max-width: 100%; height: auto; }
						}
					</style>
				</head>
				<body>
					<img src="${croppedPngDataUrl}" />
					<script>
						window.onload = () => {
							setTimeout(() => window.print(), 500);
						};
					</script>
				</body>
				</html>
			`);
			printWindow.document.close();
		};
		image.onerror = () => {
			console.error("Failed to load image for printing");
		};
		image.src = fullPngDataUrl;
	} catch (error) {
		console.error("Error printing diagram:", error);
		throw error;
	}
};
