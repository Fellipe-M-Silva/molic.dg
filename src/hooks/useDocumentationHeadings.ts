import { useMemo } from "react";
import type { DocumentElement } from "../types/documentation";

export interface Heading {
	id: string;
	text: string;
	level: number;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export function useDocumentationHeadings(
	elements: DocumentElement[],
): Heading[] {
	return useMemo(() => {
		return elements
			.filter((el) => el.type.startsWith("heading"))
			.map((el) => ({
				id: slugify(el.content || ""),
				text: el.content || "",
				level: el.level || 1,
			}));
	}, [elements]);
}

export function slugifyHeading(text: string): string {
	return slugify(text);
}
