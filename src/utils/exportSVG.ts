import { toSvg, toPng } from "html-to-image";

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

// Helper function to crop canvas image
const cropCanvasImage = (
	canvas: HTMLCanvasElement,
	cropBounds: { x: number; y: number; width: number; height: number },
): string => {
	const croppedCanvas = document.createElement("canvas");
	croppedCanvas.width = cropBounds.width;
	croppedCanvas.height = cropBounds.height;

	const ctx = croppedCanvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get canvas context");

	ctx.drawImage(
		canvas,
		cropBounds.x,
		cropBounds.y,
		cropBounds.width,
		cropBounds.height,
		0,
		0,
		cropBounds.width,
		cropBounds.height,
	);

	return croppedCanvas.toDataURL("image/png");
};

export const exportDiagramAsPNG = async (
	diagramElement: HTMLElement | null,
	filename: string = "diagram.png",
	margin: number = 20,
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

		// Calculate content bounds with margin
		const contentBounds = calculateContentBounds(diagramElement);
		const pixelRatio = 3;
		const cropWidth = (contentBounds.width + margin * 2) * pixelRatio;
		const cropHeight = (contentBounds.height + margin * 2) * pixelRatio;
		const cropX = (contentBounds.left - margin) * pixelRatio;
		const cropY = (contentBounds.top - margin) * pixelRatio;

		// Export full diagram as PNG first
		const fullPngDataUrl = await toPng(diagramElement, {
			cacheBust: true,
			pixelRatio: pixelRatio,
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

		// Create image from data URL and crop using canvas
		const image = new Image();
		image.onload = () => {
			const croppedPngDataUrl = cropCanvasImage(
				(() => {
					const tempCanvas = document.createElement("canvas");
					tempCanvas.width = image.width;
					tempCanvas.height = image.height;
					const ctx = tempCanvas.getContext("2d");
					if (ctx) ctx.drawImage(image, 0, 0);
					return tempCanvas;
				})(),
				{
					x: Math.max(0, Math.floor(cropX)),
					y: Math.max(0, Math.floor(cropY)),
					width: Math.ceil(cropWidth),
					height: Math.ceil(cropHeight),
				},
			);

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
