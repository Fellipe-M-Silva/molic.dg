// Import markdown files directly using Vite's ?raw query
// This allows us to edit markdown files directly without worrying about backticks
import gettingStartedMd from "./getting-started.md?raw";
import syntaxConceptsMd from "./syntax-concepts.md?raw";
import apiReferenceMd from "./api-reference.md?raw";
import recipesMd from "./recipes.md?raw";

export const documentationContent = {
	"getting-started": gettingStartedMd,
	"syntax-concepts": syntaxConceptsMd,
	"api-reference": apiReferenceMd,
	recipes: recipesMd,
} as const;
