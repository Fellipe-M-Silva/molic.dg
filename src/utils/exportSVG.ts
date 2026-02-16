import { toSvg } from "html-to-image";

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

export const exportDiagramAsPNG = async (
	diagramElement: HTMLElement | null,
	filename: string = "diagram.png",
) => {
	if (!diagramElement) {
		console.error("Diagram element not found");
		return;
	}

	try {
		const imageDataUrl = await toSvg(diagramElement, {
			cacheBust: true,
			pixelRatio: 2,
		});

		// Create a link element and trigger download
		const link = document.createElement("a");
		link.href = imageDataUrl;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error("Error exporting diagram as PNG:", error);
		throw error;
	}
};
